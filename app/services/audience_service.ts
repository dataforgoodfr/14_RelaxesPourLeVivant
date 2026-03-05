import Audience from '#models/audience'
import db from '@adonisjs/lucid/services/db'

type SearchAudiencesQuery = {
  search?: string
  startDate?: string
  endDate?: string
  decision?: string
  juridiction?: string
  chefDePrevention?: string
  ville?: string
  collectif?: string
  page?: number
}

export class AudienceService {
  /**
   * Get an audience if both the audience and its procedure are published.
   * @param id
   * @returns
   * @throws E_ROW_NOT_FOUND
   */
  async getAudiencePubliee(id: number) {
    return Audience.query()
      .where('id', id)
      .andWhere('publiee', true)
      .andWhereHas('procedure', (query) => {
        query.where('publiee', true)
      })
      .preload('procedure')
      .firstOrFail()
  }

  async searchAudiences(searchQuery: SearchAudiencesQuery) {
    const query = db
      .query()
      .with('timeline', (q) => {
        q.from('audiences')
          .select(
            'reference_procedure',
            db.raw(
              "array_agg(json_object('{id,date}', ARRAY[id::text, date_de_l_audience::text])) as audiences"
            )
          )
          .groupBy('reference_procedure')
      })
      .select(
        'audiences.*',
        'procedures.titre',
        'procedures.faits_detailles',
        'procedures.faits_concis',
        'procedures.collectif_d_action_ou_lutte',
        'timeline.audiences as timeline'
      )
      .from('audiences')
      .join('procedures', 'audiences.reference_procedure', 'procedures.reference_procedure')
      .join('timeline', 'timeline.reference_procedure', 'audiences.reference_procedure')
      .where('audiences.publiee', true)
      .andWhere('procedures.publiee', true)

    if (searchQuery.search) {
      query.andWhereRaw("procedures.faits_detailles_searchable @@ to_tsquery('french', ?)", [
        searchQuery.search,
      ])
    }

    if (searchQuery.startDate && searchQuery.endDate) {
      query.andWhereBetween('audiences.date_de_l_audience', [
        searchQuery.startDate,
        searchQuery.endDate,
      ])
    }

    if (searchQuery.decision) {
      query.andWhere('audiences.decision_pour_les_infractions_principales', searchQuery.decision)
    }

    if (searchQuery.juridiction) {
      query.andWhere('audiences.juridiction', searchQuery.juridiction)
    }

    if (searchQuery.ville) {
      query.andWhere('audiences.ville_de_l_audience', searchQuery.ville)
    }

    if (searchQuery.collectif) {
      query.andWhere('procedures.collectif_d_action_ou_lutte', searchQuery.collectif)
    }

    return query.paginate(searchQuery.page ?? 1, 50)
  }

  async getVilles(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('villes')
  }
}
