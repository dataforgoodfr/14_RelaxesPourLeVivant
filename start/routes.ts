/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const audiencesController = () => import('#controllers/audiences_controller')

router.get('/', [HomeController, 'home'])
router.get('/audiences/:id', [audiencesController, 'get'])
router.on('/sign-up').render('pages/auth/sign_up')
router.on('/sign-in').render('pages/auth/sign_in')
router.post('/sign-up', [AuthController, 'signup'])
router.post('/sign-in', [AuthController, 'signin'])
router.post('/logout', [AuthController, 'signout'])
