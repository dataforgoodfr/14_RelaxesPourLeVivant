import User from '#models/user'
import { createUserValidator } from '#validators/create_user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async signup({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const user = await User.create(payload)

    await auth.use('web').login(user)
    return response.redirect('/')
  }

  async signin({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect('/')
    } catch {
      session.flash('errors.auth', 'Invalid credentials')
      return response.redirect().back()
    }
  }

  async signout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/sign-in')
  }
}
