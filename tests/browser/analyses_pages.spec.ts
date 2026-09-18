import { UserFactory } from '#database/factories/user_factory'
import { DashboardFactory } from '#database/factories/dashboard_factory'
import Utilisateur from '#models/user'
import Dashboard from '#models/dashboard'
import { test } from '@japa/runner'

test
  .group('analyses pages', () => {
    test('unauthenticated user is redirected to sign-in', async ({ visit }) => {
      const page = await visit('/analyses/1')
      await page.assertPath('/sign-in')
    })

    test('authenticated user can view published analysis', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').create()
      const dashboard = await DashboardFactory.apply('publiee').create()

      await browserContext.loginAs(user)

      const page = await visit(`/analyses/${dashboard.id}`)

      await page.assertExists(page.locator('metabase-dashboard'))
    })

    test('unpublished analysis returns 404', async ({ visit, browserContext }) => {
      const user = await UserFactory.apply('approved').create()
      const dashboard = await DashboardFactory.apply('draft').create()

      await browserContext.loginAs(user)

      const page = await visit(`/analyses/${dashboard.id}`)

      await page.assertText('h1', '404 - Page non trouvée')
    })
  })
  .teardown(async () => {
    await Utilisateur.truncate(true)
    await Dashboard.truncate(true)
  })
