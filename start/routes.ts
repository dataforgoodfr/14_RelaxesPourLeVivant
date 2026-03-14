/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import env from '#start/env'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const ImportsController = () => import('#controllers/imports_controller')
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const AudiencesController = () => import('#controllers/audiences_controller')
const WebhooksController = () => import('#controllers/webhooks_controller')

router.on('/welcome').render('pages/welcome').use(middleware.guest())
router.get('/audiences', [HomeController, 'home']).use(middleware.auth())
router
  .get('/audiences/:id/recits/:recitId', [AudiencesController, 'getRecitFile'])
  .as('audiences.recits')
  .use(middleware.auth())
router
  .get('/audiences/:id/jugements/:jugementId', [AudiencesController, 'getJugementFile'])
  .as('audiences.jugements')
  .use(middleware.auth())
router.get('/audiences/:id', [AudiencesController, 'get']).use(middleware.auth())
router.on('/sign-up').render('pages/auth/sign_up')
router.on('/sign-in').render('pages/auth/sign_in').use(middleware.guest())
router.on('/change-password').render('pages/auth/change_password').use(middleware.auth())
router.on('/forgotten-password').render('pages/auth/forgotten_password')
router.get('/reset-password/:token/:email', [AuthController, 'showResetPassword'])

router.post('/sign-up', [AuthController, 'signup'])
router.post('/sign-in', [AuthController, 'signin'])
router.post('/logout', [AuthController, 'signout'])
router.post('/change-password', [AuthController, 'changePassword']).use(middleware.auth())
router.post('/forgotten-password', [AuthController, 'forgottenPassword'])
router.post('/reset-password', [AuthController, 'handleResetPassword'])

router
  .group(() => {
    router.post('/webhooks/user', [WebhooksController, 'user'])
    router
      .put('/imports/:table', [ImportsController, 'import'])
      .where('table', /^(procedures|audiences)$/)
  })
  .prefix('/_')
  .use(middleware.admin())

if (env.get('NODE_ENV') === 'development') {
  router.on('/dev/design').render('designSystem/design_system')
}

router.on('*').redirectToPath('/welcome')
