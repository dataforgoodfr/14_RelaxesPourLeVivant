import { UserFactory } from '#database/factories/user_factory'
import Utilisateur from '#models/user'
import { test } from '@japa/runner'

test
  .group('signin', () => {
    test('user is unknown', async ({ visit }) => {
      const page = await visit('/sign-in')

      const form = page.locator('form[action="/sign-in"]')

      await form.getByLabel('Email').fill('unkown-user@mail.com')
      await form.getByLabel('Mot de passe').fill('random-password')
      await form.getByRole('button').click()

      await page.assertVisible(page.getByText('Mot de passe ou email incorrect.'))
    })

    test('user is known and approved', async ({ visit }) => {
      const user = await UserFactory.merge({ password: 'random-password' })
        .apply('approved')
        .create()

      const page = await visit('/sign-in')

      const form = page.locator('form[action="/sign-in"]')

      await form.getByLabel('Email').fill(user.email)
      await form.getByLabel('Mot de passe').fill('random-password')
      await form.getByRole('button').click()

      await page.assertPath('/audiences')
    })

    test('user is known but not approved', async ({ visit }) => {
      const user = await UserFactory.merge({ password: 'random-password' })
        .apply('not approved')
        .create()

      const page = await visit('/sign-in')

      const form = page.locator('form[action="/sign-in"]')

      await form.getByLabel('Email').fill(user.email)
      await form.getByLabel('Mot de passe').fill('random-password')
      await form.getByRole('button').click()

      await page.assertVisible(
        page.getByText(
          "Vous n'êtes pas autorisé, si vous pensez que c'est un problème contactez nous."
        )
      )
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
  })
