import { AudienceService } from '#services/audience_service'
import { NocodbService } from '#services/nocodb_service'
import { ProcedureService } from '#services/procedure_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { Readable } from 'node:stream'

@inject()
export default class AudiencesController {
  constructor(
    public audienceService: AudienceService,
    public procedureService: ProcedureService,
    public nocodbService: NocodbService
  ) {}

  /**
   * Returns the page for an audience if both audience and its procedure are published.
   * - Regroup unique audiences mots_cles
   * - Regroup every liens presse and sort them alphabetically.
   * @param HttpContext
   * @returns
   */
  async get({ request, view }: HttpContext) {
    const procedureWithAudiences = await this.procedureService.getProcedureWithAudiencesPubliees(
      request.param('id')
    )
    const audience = procedureWithAudiences.audiences.find(
      (a) => a.id === Number(request.param('id'))
    )
    const motsCles = procedureWithAudiences.audiences.reduce((acc, item) => {
      if (item.mots_cles) {
        item.mots_cles.forEach((motCle) => acc.add(motCle))
      }
      return acc
    }, new Set<string>())
    const liensPresse = [
      ...(procedureWithAudiences.la_presse_parle_des_faits ?? []),
      ...procedureWithAudiences.audiences.flatMap((a) => a.la_presse_parle_du_proces ?? []),
    ].sort((a, b) => a.titre.localeCompare(b.titre))

    return view.render('pages/audience', {
      procedure: procedureWithAudiences,
      currentAudience: audience,
      motsCles: Array.from(motsCles),
      liensPresse,
    })
  }

  /**
   * Returns the blob file associated to the jugement of a published audience.
   * @param HttpContext
   * @returns
   */
  async getJugementFile({ request, response }: HttpContext) {
    const audience = await this.audienceService.getAudiencePubliee(request.param('id'))
    const jugement = audience.jugement_ou_arret?.find((r) => r.id === request.param('jugementId'))

    if (!jugement) {
      return response.notFound('Jugement non trouvé')
    }

    const result = await this.nocodbService.fetchAttachmentFile(jugement.path)
    if (result.body) {
      response.header('Content-Type', 'application/octet-stream')
      response.header('Content-Disposition', `inline; filename="${jugement.title}"`)
      return response.stream(Readable.fromWeb(result.body))
    }
    return response.noContent()
  }
}
