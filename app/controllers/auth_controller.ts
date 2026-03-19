import { SIGNUP_SUCCESS } from '#config/constants'
import User from '#models/user'
import env from '#start/env'
import { changePasswordValidator } from '#validators/change_password'
import { createUserValidator } from '#validators/create_user'
import { resetPasswordValidator } from '#validators/reset_password'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@adonisjs/lucid'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class AuthController {
  async signup({ request, response, session }: HttpContext) {
    const { confirmPassword, ...payload } = await request.validateUsing(createUserValidator)

    await User.create(payload)

    session.flash('notification', {
      type: 'success',
      code: SIGNUP_SUCCESS,
    })

    return response.redirect().back()
  }

  async signin({ request, auth, response, session }: HttpContext) {
    const { email, password, targetPath } = request.only(['email', 'password', 'targetPath'])

    try {
      const user = await User.verifyCredentials(email, password)
      if (!user.approved) {
        session.flash(
          'errors.auth',
          "Vous n'êtes pas autorisé, si vous pensez que c'est un problème contactez nous."
        )
        return response.redirect().withQs().back()
      }
      await auth.use('web').login(user, !!request.input('rememberMe'))
      return response.redirect(targetPath)
    } catch {
      session.flash('errors.auth', 'Mot de passe ou email incorrect.')
      session.flash('email', email)
      return response.redirect().withQs().back()
    }
  }

  async signout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/sign-in')
  }

  async forgottenPassword({ request, response, session }: HttpContext) {
    const email = request.input('email')

    try {
      const user = await User.findByOrFail('email', email)
      user.passwordToken = crypto.randomBytes(10).toString('hex')
      user.passwordTokenCreatedAt = DateTime.now()
      await user.save()

      await mail.send((message) => {
        message
          .to(user.email)
          .from(env.get('ADMIN_EMAIL'))
          .subject('Demande de mot de passe')
          .htmlView('emails/forgotten_password', { user })
      })
    } catch (error) {
      if (!(error instanceof errors.E_ROW_NOT_FOUND)) {
        throw error
      }
    }

    session.flash(
      'success.forgotten_password',
      "Si le compte existe, un e-mail de réinitialisation de mot de passe va vous parvenir d'ici quelques instants. Pensez à vérifier vos spams."
    )

    return response.redirect().back()
  }

  async showResetPassword({ view, params }: HttpContext) {
    return view.render('pages/auth/reset_password', {
      token: params.token,
      email: params.email,
    })
  }

  async handleResetPassword({ request, response, session }: HttpContext) {
    const { email, password, token } = await request.validateUsing(resetPasswordValidator)

    const user = await User.query()
      .where('email', email)
      .where('passwordToken', token)
      .where('passwordTokenCreatedAt', '>', DateTime.now().minus({ hours: 2 }).toSQL())
      .first()

    if (!user) {
      session.flash(
        'errors.password_reset',
        'Lien de changement de mot de passe invalide ou expiré.'
      )
      return response.redirect().toPath('/forgotten-password')
    }

    user.merge({
      password,
      passwordToken: null,
      passwordTokenCreatedAt: null,
    })

    await user.save()

    session.flash('success.password_reset', 'Le mot de passe a bien été modifié.')
    return response.redirect().toPath('/sign-in')
  }

  async changePassword({ auth, request, response, session }: HttpContext) {
    const { oldPassword, newPassword } = await request.validateUsing(changePasswordValidator)

    try {
      // this route is already protected via auth middleware, user cannot be undefined (auth.user!)
      const user = await User.verifyCredentials(auth.user!.email, oldPassword)
      user.password = newPassword
      await user.save()

      session.flash('success.password_change', 'Le mot de passe a bien été modifié.')
      return response.redirect().back()
    } catch (error) {
      session.flash('errors.auth', "L'ancien mot de passe ne correspond pas.")
      return response.redirect().back()
    }
  }
}
