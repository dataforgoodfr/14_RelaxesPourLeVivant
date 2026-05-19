import { multiSelectToStringList } from '#database/mappers'
import Audience from '#models/audience'
import type Procedure from '#models/procedure'
import db from '@adonisjs/lucid/services/db'
import type { SimplePaginatorContract } from '@adonisjs/lucid/types/querybuilder'
import { DateTime } from 'luxon'

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

/**
 * This is declarative type, if search method change  then it might need to be updated !
 * This type is reinforced by unit tests, feel free to improve them.
 */
export type SearchAudiencesResponse = SimplePaginatorContract<
  Audience &
    Pick<
      Procedure,
      | 'titre'
      | 'faits_detailles'
      | 'faits_concis'
      | 'collectif_d_action_ou_lutte'
      | 'date_des_faits'
    > & {
      timeline: Array<{
        id: number
        date_de_decision: DateTime | null
        degre_de_juridiction: string | null
        decision_pour_les_infractions_principales: string | null
        juridiction: string | null
        type_de_peine_pour_les_infractions_principales: string | null
        publiee: boolean
      }>
    }
>

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

  async searchAudiences(searchQuery: SearchAudiencesQuery): Promise<SearchAudiencesResponse> {
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
                  'juridiction', juridiction,
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
        'procedures.date_des_faits',
        'timeline.audiences as timeline'
      )
      .from('audiences')
      .join('procedures', 'audiences.reference_procedure', 'procedures.reference_procedure')
      .join('timeline', 'timeline.reference_procedure', 'audiences.reference_procedure')
      .where('audiences.publiee', true)
      .andWhere('procedures.publiee', true)
      .orderByRaw('audiences.date_de_l_audience DESC NULLS LAST')

    if (searchQuery.search) {
      query
        .joinRaw(
          db.raw(
            "CROSS JOIN (SELECT plainto_tsquery('french', ?) as search_str) as search_full_text_params",
            [searchQuery.search]
          )
        )
        .andWhere((q) =>
          q
            .whereRaw(
              'procedures.faits_detailles_searchable @@ "search_full_text_params"."search_str"'
            )
            .orWhereRaw('procedures.titre_searchable @@ "search_full_text_params"."search_str"')
            .orWhereRaw(
              'audiences.fondement_de_la_relaxe_searchable @@ "search_full_text_params"."search_str"'
            )
            .orWhereRaw(
              'audiences.chefs_de_prevention_categorie_text_searchable @@ "search_full_text_params"."search_str"'
            )
        )
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

    const pagination = await query.paginate(searchQuery.page ?? 1, 50)

    // Perform audiences mutation. A simple `.map()` lose the pagination metadata
    pagination.forEach((audience) => {
      audience.date_des_faits = audience.date_des_faits
        ? DateTime.fromJSDate(audience.date_des_faits)
        : null
      audience.date_de_l_audience = audience.date_de_l_audience
        ? DateTime.fromJSDate(audience.date_de_l_audience)
        : null
      audience.date_de_decision = audience.date_de_decision
        ? DateTime.fromJSDate(audience.date_de_decision)
        : null
      audience.mots_cles = multiSelectToStringList(audience.mots_cles)
      audience.chefs_de_prevention_categorie = multiSelectToStringList(
        audience.chefs_de_prevention_categorie
      )
      audience.collectif_d_action_ou_lutte = multiSelectToStringList(
        audience.collectif_d_action_ou_lutte
      )
      audience.timeline = audience.timeline.map((t: Record<string, any>) => {
        return {
          ...t,
          date_de_decision: t.date_de_decision ? DateTime.fromISO(t.date_de_decision) : null,
        }
      })
    })

    return pagination as SearchAudiencesResponse
  }

  async getVilles(): Promise<Array<{ nom: string }>> {
    return await db.query().select('*').from('villes').whereNotNull('nom')
  }

  async getCollectifs(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('collectifs').whereNotNull('nom')
  }

  async getChefDePreventionCategories(): Promise<Array<{ intitule: string }>> {
    return db.query().select('*').from('chef_prevention_categories').whereNotNull('intitule')
  }

  async getJuridictions(): Promise<Array<{ intitule: string }>> {
    return db.query().select('*').from('juridictions').whereNotNull('intitule')
  }

  /**
   * Return the last decision of the audiences.
   * We first sort by date_de_l_audience, then we take the last one with a non null decision_pour_les_infractions_principales.
   * @param audiences
   * @returns
   */
  getLastDecision(audiences: Audience[]) {
    const sortedAudiencesWithDecision = audiences
      .filter((a) => Boolean(a.decision_pour_les_infractions_principales))
      .sort((a, b) => {
        if (a.date_de_l_audience && b.date_de_l_audience) {
          return b.date_de_l_audience.toMillis() - a.date_de_l_audience.toMillis()
        } else if (a.date_de_l_audience) {
          return -1
        } else if (b.date_de_l_audience) {
          return 1
        }
        return 0
      })
    return sortedAudiencesWithDecision.at(-1)?.decision_pour_les_infractions_principales
  }
}
