import { SIGNUP_SUCCESS } from '#config/constants'
import User from '#models/user'
import { createUserValidator } from '#validators/create_user'
import type { HttpContext } from '@adonisjs/core/http'

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
        return response.redirect().back()
      }
      await auth.use('web').login(user, !!request.input('rememberMe'))
      return response.redirect('/audiences')
    } catch {
      session.flash('errors.auth', 'Mot de passe ou email incorrect')
      return response.redirect().back()
    }
  }

  async signout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/sign-in')
  }
}
