/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import Audience from '#models/audience'
import Procedure from '#models/procedure'
import PresseArticle from '#models/presse_article'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { controllers } from '#generated/controllers'

router.on('/welcome').render('pages/welcome').as('landing')
router.on('/contribution').render('pages/contribution').as('contribution')
router
  .get('/audiences', [controllers.SearchAudiences, 'get'])
  .as('audiences.search')
  .use(middleware.auth())
router
  .get('/audiences/:id/jugements/:jugementId', [controllers.Audiences, 'getJugementFile'])
  .as('audiences.jugements')
  .use(middleware.auth())
router
  .get('/audiences/:id', [controllers.Audiences, 'get'])
  .as('audiences.show')
  .use(middleware.auth())
router.on('/sign-up').render('pages/auth/sign_up').as('sign-up')
router.on('/sign-in').render('pages/auth/sign_in').use(middleware.guest()).as('auth.sign_in')
router.on('/change-password').render('pages/auth/change_password').use(middleware.auth())
router.on('/forgotten-password').render('pages/auth/forgotten_password')
router
  .get('/reset-password/:token/:email', [controllers.Auth, 'showResetPassword'])
  .as('auth.show_reset_password')
router
  .get('/analyses/:id', [controllers.Analyses, 'get'])
  .where('id', router.matchers.number())
  .as('analyses.show')
  .use(middleware.auth())
router.on('/legal').render('pages/legal').as('legal')
router.on('/terms-of-use').render('pages/terms_of_use').as('terms_of_use')

router.post('/sign-up', [controllers.Auth, 'signup'])
router.post('/sign-in', [controllers.Auth, 'signin'])
router.post('/logout', [controllers.Auth, 'signout'])
router
  .post('/change-password', [controllers.Auth, 'changePassword'])
  .as('auth.change_password')
  .use(middleware.auth())
router.post('/forgotten-password', [controllers.Auth, 'forgottenPassword'])
router.post('/reset-password', [controllers.Auth, 'handleResetPassword'])

router
  .group(() => {
    router.get('/imports', [controllers.Imports, 'showImport']).as('admin.imports')
    router
      .on('/exports')
      .render('pages/admin/exports', {
        tables: [Procedure.table, Audience.table, PresseArticle.table],
      })
      .as('admin.exports')
    router.on('/').redirect('admin.imports')
  })
  .prefix('/admin')

router
  .group(() => {
    router.post('/webhooks/user', [controllers.Webhooks, 'user'])
    router
      .post('/imports/:table', [controllers.Imports, 'import'])
      .where('table', `^(${Procedure.table}|${Audience.table}|${PresseArticle.table})$`)
    router
      .get('/exports/:table', [controllers.Imports, 'export'])
      .where('table', `^(${Procedure.table}|${Audience.table}|${PresseArticle.table})$`)
  })
  .prefix('/_')
  .use(middleware.admin())

if (env.get('NODE_ENV') === 'development') {
  router.on('/dev/design').render('design_system/design_system')
}

router.get('/health/live', [controllers.HealthChecks, 'live'])
router.get('/health/ready', [controllers.HealthChecks, 'ready'])

router.on('*').redirectToPath('/welcome')
