import { AudienceService } from '#services/audience_service'
import { NocodbService } from '#services/nocodb_service'
import { inject } from '@adonisjs/core'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import { Readable } from 'node:stream'

@inject()
export default class AudiencesController {
  constructor(
    public audienceService: AudienceService,
    public nocodbService: NocodbService
  ) {}

  /**
   * Returns the page for an audience if both audience and its procedure are published.
   * @param HttpContext
   * @returns
   */
  async get({ request, view }: HttpContext) {
    const audience = await this.audienceService.getAudiencePubliee(request.param('id'))

    return view.render('pages/audience', {
      audience,
      stringHelper: string,
    })
  }

  /**
   * Returns the blob file associated to the recit of a published audience.
   * @param HttpContext
   * @returns
   */
  async getRecit({ request, response }: HttpContext) {
    const audience = await this.audienceService.getAudiencePubliee(request.param('id'))
    const recit = audience.recit_d_audience?.find((r) => r.id === request.param('recitId'))

    if (!recit) {
      return response.notFound('Récit d’audience non trouvé')
    }

    const result = await this.nocodbService.fetchAttachmentFile(recit.path)
    if (result.body) {
      response.header('Content-Type', 'application/octet-stream')
      response.header('Content-Disposition', `inline; filename="${recit.title}"`)
      return response.stream(Readable.fromWeb(result.body))
    }
    return response.noContent()
  }
}
