import env from '#start/env'
import jwt from 'jsonwebtoken'
import type { HttpContext } from '@adonisjs/core/http'

export default class AnalyzesController {
  get({ view }: HttpContext) {
    const token = jwt.sign(
      {
        resource: { dashboard: 3 },
        params: {},
        exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
      },
      env.get('METABASE_SECRET_KEY')
    )
    return view.render('pages/analyze', { token })
  }
}
