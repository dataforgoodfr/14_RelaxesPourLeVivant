import { SIGNUP_SUCCESS, FORGOT_PASSWORD_SENT } from '#config/constants'
import User from '#models/user'
import { createUserValidator } from '#validators/create_user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import { errors } from '@adonisjs/lucid'
import mail from '@adonisjs/mail/services/main'
import { resetPasswordValidator } from '#validators/reset_password'

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
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      if (!user.approved) {
        session.flash(
          'errors.auth',
          "Vous n'êtes pas autorisé, si vous pensez que c'est un problème contactez nous"
        )
        return response.redirect('/sign-in')
      }
      await auth.use('web').login(user, !!request.input('rememberMe'))
      return response.redirect('/audiences')
    } catch {
      session.flash('errors.auth', 'Mot de passe ou email incorrect')
      return response.redirect('/sign-in')
    }
  }

  async signout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/sign-in')
  }

  async forgottenpassword({ request, response, session }: HttpContext) {
    const email = request.input('email')

    try {
      const user = await User.findByOrFail('email', email)
      user.passwordToken = crypto.randomBytes(10).toString('hex')
      user.passwordTokenCreatedAt = DateTime.now()
      await user.save()

      await mail.send((message) => {
        message
          .to(user.email)
          .from('info@example.org')
          .subject('Demande de mot de passe')
          .htmlView('emails/forgotten_password', { user })
      })
    } catch (error) {
      if (!(error instanceof errors.E_ROW_NOT_FOUND)) {
        throw error
      }
    }

    session.flash('notification', {
      type: 'success',
      code: FORGOT_PASSWORD_SENT,
    })

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

    console.log(user)

    if (!user) {
      session.flash('notification', { type: 'error', message: 'Lien invalide ou expiré.' })
      return response.redirect().toPath('/forgotten-password')
    }

    user.merge({
      password,
      passwordToken: null,
      passwordTokenCreatedAt: null,
    })

    await user.save()

    session.flash('notification', { type: 'success', message: 'Mot de passe modifié !' })
    return response.redirect().toPath('/sign-in')
  }
}
