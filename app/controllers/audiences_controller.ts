import Audience from '#models/audience'
import type { HttpContext } from '@adonisjs/core/http'

export default class AudiencesController {
  async get({ request, view }: HttpContext) {
    const audience = await Audience.query()
      .where('id', request.param('id'))
      .preload('procedure')
      .firstOrFail()

    return view.render('pages/audience', { audience })
  }
}
