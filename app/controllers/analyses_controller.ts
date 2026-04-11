import Dashboard from '#models/dashboard'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export default class AnalysesController {
  async get({ view, request }: HttpContext) {
    const dashboard = await Dashboard.findByOrFail({
      id: request.param('id'),
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
    return view.render('pages/analyse', { token })
  }
}
