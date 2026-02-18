import { UserFactory } from '#database/factories/user_factory'
import Utilisateur from '#models/user'
import { test } from '@japa/runner'

test.group('signin', () => {
  let user: Utilisateur

  test('user is unknown', async ({ client }) => {
    const response = await client
      .post('/sign-in')
      .form({
        email: 'unknown-user@mail.com',
        password: 'random-password',
        rememberMe: false,
      })
      .withCsrfToken()

    response.assertRedirectsTo('/sign-in')
  })

  test('user is known and approved', async ({ client }) => {
    const response = await client
      .post('/sign-in')
      .form({
        email: user.email,
        password: 'random-password',
        rememberMe: false,
      })
      .withCsrfToken()

    response.assertRedirectsTo('/audiences')
  }).setup(async () => {
    user = await UserFactory.merge({ password: 'random-password' }).apply('approved').create()

    return async () => {
      await user.delete()
    }
  })

  test('user is known but not approved', async ({ client }) => {
    const response = await client
      .post('/sign-in')
      .form({
        email: user.email,
        password: 'random-password',
        rememberMe: false,
      })
      .withCsrfToken()

    response.assertRedirectsTo('/sign-in')
  }).setup(async () => {
    user = await UserFactory.merge({ password: 'random-password' }).create()

    return async () => {
      await user.delete()
    }
  })
})
