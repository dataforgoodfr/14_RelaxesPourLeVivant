/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import env from '#start/env'
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const AudiencesController = () => import('#controllers/audiences_controller')

router.on('/welcome').render('pages/welcome').use(middleware.guest())
router.get('/audiences', [HomeController, 'home']).use(middleware.auth())
router.get('/audiences/:id', [AudiencesController, 'get']).use(middleware.auth())
router.on('/sign-up').render('pages/auth/sign_up')
router.on('/sign-in').render('pages/auth/sign_in').use(middleware.guest())

router.post('/sign-up', [AuthController, 'signup'])
router.post('/sign-in', [AuthController, 'signin'])
router.post('/logout', [AuthController, 'signout'])

router.on('/').redirectToPath('/welcome')

if (env.get('NODE_ENV') === 'development') {
  router.on('/dev/design').render('designSystem/design_system')
}
