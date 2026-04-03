import env from '#start/env'
import jwt from 'jsonwebtoken'
import type { HttpContext } from '@adonisjs/core/http'
import Dashboard from '#models/dashboard'

export default class AnalyzesController {
  async get({ view, request }: HttpContext) {
    const dashboard = await Dashboard.findByOrFail({
      metabaseId: request.param('id'),
      publiee: true,
    })

    const token = jwt.sign(
      {
        resource: { dashboard: dashboard.metabaseId },
        params: {},
        exp: Math.round(Date.now() / 1000) + 2 * 60, // 2 minute expiration
      },
      env.get('METABASE_SECRET_KEY')
    )
    return view.render('pages/analyze', { token })
  }
}
