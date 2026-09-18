import { UserFactory } from '#database/factories/user_factory'
import { ProcedureFactory } from '#database/factories/procedure_factory'
import Utilisateur from '#models/user'
import Procedure from '#models/procedure'
import Audience from '#models/audience'
import { test } from '@japa/runner'

test
  .group('search audiences', () => {
    test('unauthenticated user is redirected to sign-in', async ({ visit }) => {
      const page = await visit('/audiences')
      await page.assertPath('/sign-in')
    })

    test('search filters are visible', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').create()

      await browserContext.loginAs(user)

      const page = await visit('/audiences')

      await page.assertPath('/audiences')
      const form = page.locator('form#search')
      await page.assertVisible(form.getByPlaceholder('Faits, chef de prévention...'))
      await page.assertVisible(form.getByPlaceholder('Date de la décision'))
      await page.assertVisible(form.getByPlaceholder('Chef de prévention', { exact: true }))
      await page.assertVisible(form.locator('#more-filters'))
      await page.assertVisible(form.locator('[type=submit]'))
    })

    test('can view audience details', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').create()
      const procedure = await ProcedureFactory.apply('publiee')
        .with('audiences', 1, (audience) => audience.apply('publiee'))
        .create()

      const audience = procedure.audiences[0]

      await browserContext.loginAs(user)

      const page = await visit(`/audiences/${audience.id}`)

      await page.assertPath(`/audiences/${audience.id}`)
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
    await Procedure.truncate(true)
    await Audience.truncate(true)
  })
