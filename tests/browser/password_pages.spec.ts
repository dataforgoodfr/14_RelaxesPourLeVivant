import { UserFactory } from '#database/factories/user_factory'
import Utilisateur from '#models/user'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'

test
  .group('forgotten password', () => {
    test('displays forgotten password form', async ({ visit }) => {
      const page = await visit('/forgotten-password')
      await page.assertPath('/forgotten-password')
      await page.assertVisible(page.getByLabel('Email'))
      await page.assertVisible(page.locator('form[action="/forgotten-password"]'))
    })

    test('submits with valid email', async ({ visit }) => {
      const fake = mail.fake()

      await UserFactory.merge({ email: 'test@example.com' }).create()

      const page = await visit('/forgotten-password')
      const form = page.locator('form[action="/forgotten-password"]')

      await form.getByLabel('Email').fill('test@example.com')
      await form.locator('[type=submit]').click()

      await page.assertVisible(
        page.getByText(
          "Si le compte existe, un e-mail de réinitialisation de mot de passe va vous parvenir d'ici quelques instants"
        )
      )

      await fake.close()
    }).teardown(async () => {
      await Utilisateur.truncate(true)
    })

    test('submits with invalid email shows success message', async ({ visit }) => {
      const page = await visit('/forgotten-password')
      const form = page.locator('form[action="/forgotten-password"]')

      await form.getByLabel('Email').fill('nonexistent@example.com')
      await form.locator('[type=submit]').click()

      await page.assertVisible(
        page.getByText(
          "Si le compte existe, un e-mail de réinitialisation de mot de passe va vous parvenir d'ici quelques instants"
        )
      )
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
  })

test
  .group('reset password', () => {
    test('displays reset password page with valid token', async ({ visit }) => {
      const user = await UserFactory.merge({
        passwordToken: 'valid-token',
        passwordTokenCreatedAt: DateTime.now(),
      }).create()

      const page = await visit(`/reset-password/valid-token/${user.email}`)
      await page.assertPath(`/reset-password/valid-token/${user.email}`)
      await page.assertVisible(page.getByLabel('Nouveau mot de passe *', { exact: true }))
      await page.assertVisible(page.getByLabel('Confirmer le nouveau mot de passe'))
    })

    test('submits new password successfully', async ({ visit }) => {
      const user = await UserFactory.merge({
        passwordToken: 'valid-token',
        passwordTokenCreatedAt: DateTime.now(),
      }).create()

      const page = await visit(`/reset-password/valid-token/${user.email}`)
      const form = page.locator('form[action="/reset-password"]')

      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('new-password-123')
      await form.locator('[type=submit]').click()

      await page.assertPath('/sign-in')
    })

    test('fails with invalid token', async ({ visit }) => {
      const user = await UserFactory.create()

      const page = await visit(`/reset-password/invalid-token/${user.email}`)
      const form = page.locator('form[action="/reset-password"]')

      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('new-password-123')
      await form.locator('[type=submit]').click()

      await page.assertVisible(
        page.getByText('Lien de changement de mot de passe invalide ou expiré.')
      )
    })

    test('fails with expired token', async ({ visit }) => {
      const user = await UserFactory.merge({
        passwordToken: 'expired-token',
        passwordTokenCreatedAt: DateTime.now().minus({ hours: 3 }),
      }).create()

      const page = await visit(`/reset-password/expired-token/${user.email}`)
      const form = page.locator('form[action="/reset-password"]')

      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('new-password-123')
      await form.locator('[type=submit]').click()

      await page.assertVisible(
        page.getByText('Lien de changement de mot de passe invalide ou expiré.')
      )
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
  })

test
  .group('change password', () => {
    test('user can change password', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').merge({ password: 'old-password' }).create()

      await browserContext.loginAs(user)

      const page = await visit('/change-password')

      const form = page.locator('form[action="/change-password"]')
      await form.getByLabel('Mot de passe actuel').fill('old-password')
      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('new-password-123')
      await form.locator('[type=submit]').click()

      await page.assertVisible(page.getByText('Votre mot de passe a été modifié.'))
    })

    test('fails with wrong old password', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').merge({ password: 'old-password' }).create()

      await browserContext.loginAs(user)

      const page = await visit('/change-password')

      const form = page.locator('form[action="/change-password"]')
      await form.getByLabel('Mot de passe actuel').fill('wrong-password')
      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('new-password-123')
      await form.locator('[type=submit]').click()

      await page.assertVisible(page.getByText("L'ancien mot de passe ne correspond pas."))
    })

    test('fails with password confirmation mismatch', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').merge({ password: 'old-password' }).create()

      await browserContext.loginAs(user)

      const page = await visit('/change-password')

      const form = page.locator('form[action="/change-password"]')
      await form.getByLabel('Mot de passe actuel').fill('old-password')
      await form.getByLabel('Nouveau mot de passe *', { exact: true }).fill('new-password-123')
      await form.getByLabel('Confirmer le nouveau mot de passe').fill('different-password')
      await form.locator('[type=submit]').click()

      await page.assertVisible(page.getByText('La confirmation du mot de passe ne correspond pas.'))
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
  })
