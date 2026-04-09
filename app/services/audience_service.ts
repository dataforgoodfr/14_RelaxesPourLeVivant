import { TimelineDataMapper } from '#controllers/mappers/timeline_mapper'
import { multiSelectToStringList } from '#database/mappers'
import Audience from '#models/audience'
import db from '@adonisjs/lucid/services/db'

type SearchAudiencesQuery = {
  search?: string
  dateDesFaits?: string[]
  dateDeLaDecision?: string[]
  dateAudience?: string[]
  decision?: string
  juridiction?: string
  chefDePrevention?: string[]
  ville?: string
  collectif?: string[]
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
              `array_agg(
                jsonb_build_object(
                  'id', id,
                  'date_de_decision', date_de_decision,
                  'degre_de_juridiction', degre_de_juridiction,
                  'decision_pour_les_infractions_principales', decision_pour_les_infractions_principales,
                  'type_de_peine_pour_les_infractions_principales', type_de_peine_pour_les_infractions_principales,
                  'publiee', publiee
                )
              ) as audiences`
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
      query.andWhereRaw("procedures.faits_detailles_searchable @@ plainto_tsquery('french', ?)", [
        searchQuery.search,
      ])
    }

    if (searchQuery.dateAudience && searchQuery.dateAudience.length === 2) {
      query.andWhereBetween('audiences.date_de_l_audience', [
        searchQuery.dateAudience[0],
        searchQuery.dateAudience[1],
      ])
    }

    if (searchQuery.dateDeLaDecision && searchQuery.dateDeLaDecision.length === 2) {
      query.andWhereBetween('audiences.date_de_decision', [
        searchQuery.dateDeLaDecision[0],
        searchQuery.dateDeLaDecision[1],
      ])
    }

    if (searchQuery.dateDesFaits && searchQuery.dateDesFaits.length === 2) {
      query.andWhereBetween('procedures.date_des_faits', [
        searchQuery.dateDesFaits[0],
        searchQuery.dateDesFaits[1],
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

    if (searchQuery.chefDePrevention) {
      query.andWhere(
        'audiences.chefs_de_prevention_categorie_searchable',
        '&&',
        searchQuery.chefDePrevention
      )
    }

    if (searchQuery.collectif) {
      query.andWhere(
        'procedures.collectif_d_action_ou_lutte_searchable',
        '&&',
        searchQuery.collectif
      )
    }

    return query.paginate(searchQuery.page ?? 1, 50).then((page) => {
      const timelineDataMapper = new TimelineDataMapper()
      return page.map((audience) => ({
        ...audience,
        mots_cles: multiSelectToStringList(audience.mots_cles),
        chefs_de_prevention_categorie: multiSelectToStringList(
          audience.chefs_de_prevention_categorie
        ),
        collectif_d_action_ou_lutte: multiSelectToStringList(audience.collectif_d_action_ou_lutte),
        timeline: timelineDataMapper.map(audience),
      }))
    }) as ReturnType<typeof query.paginate>
  }

  async getVilles(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('villes')
  }

  async getCollectifs(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('collectifs')
  }

  async getChefDePreventionCategories(): Promise<Array<{ intitule: string }>> {
    return db.query().select('*').from('chef_prevention_categories')
  }

  async getJuridictions(): Promise<Array<{ intitule: string }>> {
    return db.query().select('*').from('juridictions')
  }
}
