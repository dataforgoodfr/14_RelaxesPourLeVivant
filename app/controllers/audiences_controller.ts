import Audience from '#models/audience'
import type { HttpContext } from '@adonisjs/core/http'

export default class AudiencesController {
  /**
   * Returns the page for an audience if both audience and its procedure are published.
   * @param HttpContext
   * @returns
   */
  async get({ request, view }: HttpContext) {
    const audience = await Audience.query()
      .where('id', request.param('id'))
      .andWhere('publiee', true)
      .andWhereHas('procedure', (query) => {
        query.where('publiee', true)
      })
      .preload('procedure')
      .firstOrFail()

    return view.render('pages/audience', { audience })
  }
}
