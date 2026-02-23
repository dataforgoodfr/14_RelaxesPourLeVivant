import { AttachmentRecord } from '#models/vendors/nocodb'
import { AudienceService } from '#services/audience_service'
import { NocodbService } from '#services/nocodb_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { filesize } from 'filesize'
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
    const recits = JSON.parse(audience.recit_d_audience ?? '[]') as AttachmentRecord[]
    const mappedRecits = recits.map((recit) => ({
      ...recit,
      extension: recit.title.split('.')[1] ?? null,
      prettySize: filesize(recit.size, { locale: 'fr' }),
    }))

    return view.render('pages/audience', { audience, recitsFiles: mappedRecits })
  }

  /**
   * Returns the blob file associated to the recit of a published audience.
   * @param HttpContext
   * @returns
   */
  async getRecit({ request, response }: HttpContext) {
    const audience = await this.audienceService.getAudiencePubliee(request.param('id'))
    const recits = JSON.parse(audience.recit_d_audience ?? '[]') as AttachmentRecord[]
    const recit = recits.find((r) => r.id === request.param('recitId'))

    if (!recit) {
      return response.status(404).send('Récit d’audience non trouvé')
    }

    const result = await this.nocodbService.fetchAttachmentFile(recit.path)
    if (result.body) {
      response.header('Content-Type', 'application/octet-stream')
      response.header('Content-Disposition', `inline; filename="${recit.title}"`)
      return response.stream(Readable.fromWeb(result.body))
    }
    return response.status(204).send('No content available')
  }
}
