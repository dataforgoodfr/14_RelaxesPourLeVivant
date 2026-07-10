import { AudienceService } from '#services/audience_service'
import { ConfigurationService } from '#services/configuration_service'
import { NocodbService } from '#services/nocodb_service'
import { ProcedureService } from '#services/procedure_service'
import env from '#start/env'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import { Readable } from 'node:stream'

@inject()
export default class AudiencesController {
  constructor(
    private readonly audienceService: AudienceService,
    private readonly procedureService: ProcedureService,
    private readonly nocodbService: NocodbService,
    private readonly configurationService: ConfigurationService
  ) {}

  /**
   * Returns the page for an audience if both audience and its procedure are published.
   * - Regroup every liens presse and sort them alphabetically.
   * - Get the last decision of the procedure audiences.
   * @param HttpContext
   * @returns
   */
  async get({ request, view, session }: HttpContext) {
    const procedureWithAudiences = await this.procedureService.getProcedureWithAudiencesPubliees(
      request.param('id')
    )
    const audience = procedureWithAudiences.audiences.find(
      (a) => a.id === Number(request.param('id'))
    )
    const liensPresse = procedureWithAudiences.la_presse_parle_des_faits
      .concat(procedureWithAudiences.audiences.flatMap((a) => a.la_presse_parle_du_proces))
      .sort((a, b) => a.titre.localeCompare(b.titre))

    const lastDecision = this.audienceService.getLastDecision(procedureWithAudiences.audiences)

    const question = await this.configurationService.audienceGraphique()

    const metabaseToken = question
      ? jwt.sign(
          {
            resource: { question },
            params: {
              audience_id: [audience?.id],
            },
            exp: Math.round(Date.now() / 1000) + 2 * 60, // 2 minute expiration
          },
          env.get('METABASE_SECRET_KEY')
        )
      : null

    return view.render('pages/audience', {
      procedure: procedureWithAudiences,
      currentAudience: audience,
      liensPresse,
      lastDecision,
      metabaseToken,
      backUrl: session.getIntendedUrl(),
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
    if (result.ok && result.body) {
      response.header('Content-Type', 'application/octet-stream')
      response.header('Content-Disposition', `inline; filename="${jugement.title}"`)
      return response.stream(Readable.fromWeb(result.body))
    }
    return response.noContent()
  }
}
