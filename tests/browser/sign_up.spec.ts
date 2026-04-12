import { UserFactory } from '#database/factories/user_factory'
import Utilisateur from '#models/user'
import { test } from '@japa/runner'

test
  .group('signup', () => {
    test('new user', async ({ visit }) => {
      const user = await UserFactory.make()

      const page = await visit('/sign-up')

      const form = page.locator('form[action="/sign-up"]')

      await form.getByLabel('Adresse email').fill(user.email)
      await form.getByLabel('Mot de passe *', { exact: true }).fill(user.password)
      await form.getByLabel('Confirmer le mot de passe').fill(user.password)
      await form.getByLabel('Motivation de la demande').fill(user.motivation)
      await form.getByRole('button').click()

      await page.assertVisible(
        page.getByText(
          "Votre demande sera traîtée par MSDE et vous serez recontacté par mail lors de l'activation de votre compte."
        )
      )
    })

    test('user already exists', async ({ visit }) => {
      const user = await UserFactory.create()

      const page = await visit('/sign-up')

      const form = page.locator('form[action="/sign-up"]')

      await form.getByLabel('Adresse email').fill(user.email)
      await form.getByLabel('Mot de passe *', { exact: true }).fill(user.password)
      await form.getByLabel('Confirmer le mot de passe').fill(user.password)
      await form.getByLabel('Motivation de la demande').fill(user.motivation)
      await form.getByRole('button').click()

      await page.assertVisible(
        page.getByText('Un compte semble déjà associé à cette adresse e-mail.')
      )
    })

    test('confirm password is wrong', async ({ visit }) => {
      const user = await UserFactory.create()

      const page = await visit('/sign-up')

      const form = page.locator('form[action="/sign-up"]')

      await form.getByLabel('Adresse email').fill(user.email)
      await form.getByLabel('Mot de passe *', { exact: true }).fill(user.password)
      await form.getByLabel('Confirmer le mot de passe').fill(user.password + 'mistaketypo')
      await form.getByLabel('Motivation de la demande').fill(user.motivation)
      await form.getByRole('button').click()

      await page.assertVisible(page.getByText('Vos mots de passe ne sont pas identiques.'))
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
  })
