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

type TimelineItem = {
  id: number
  date_de_decision: string
  degre_de_juridiction: string
  decision_pour_les_infractions_principales: string
  type_de_peine_pour_les_infractions_principales: string
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
                json_object(
                  '{
                    id,
                    date_de_decision,
                    degre_de_juridiction,
                    decision_pour_les_infractions_principales,
                    type_de_peine_pour_les_infractions_principales
                  }',
                  ARRAY[
                    id::text, 
                    date_de_decision::text, 
                    degre_de_juridiction::text, 
                    decision_pour_les_infractions_principales::text,
                    type_de_peine_pour_les_infractions_principales::text
                  ]
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

    const results = await query.paginate(searchQuery.page ?? 1, 50)

    results.map((row) => {
      row.timeline = this.filterTimeline(row.timeline, row.id)
    })

    return results
  }

  /**
   * Filters out timeline for a given maximum number of events,
   * and sorting it ascendant with a preferred position for current audience's date
   * @param timeline
   * @param audienceId
   * @returns
   */
  private filterTimeline(timeline: TimelineItem[], audienceId: number) {
    // Algorithm parameters
    const maximumNumberOfEvents = 4
    const preferredPositionForCurrentAudience = 1

    // Sorting dates (ASC)
    const sortedTimeline = [...timeline].sort((a, b) => {
      return new Date(a.date_de_decision).getTime() - new Date(b.date_de_decision).getTime()
    })

    // When total events < maximum number of events, early return of sorted dates
    if (sortedTimeline.length <= maximumNumberOfEvents) {
      return sortedTimeline
    }

    // Splitting data into 3 groups (pasts, current, futures)
    const currentIndex = sortedTimeline.findIndex((t) => Number(t.id) === audienceId)

    if (currentIndex === -1) {
      return sortedTimeline.slice(0, maximumNumberOfEvents)
    }

    const currentEvent = sortedTimeline[currentIndex]
    const pastEvents = sortedTimeline.slice(0, currentIndex)
    const futureEvents = sortedTimeline.slice(currentIndex + 1)

    // Defining number of items per group according to preferences
    const numberOfPastEvents = Math.min(preferredPositionForCurrentAudience, pastEvents.length)
    const numberOfFutureEvents = maximumNumberOfEvents - (1 + numberOfPastEvents)

    // Building the filtered array
    const filteredArray = []
    filteredArray.push(...pastEvents.slice(pastEvents.length - numberOfPastEvents))
    filteredArray.push(currentEvent)
    filteredArray.push(...futureEvents.slice(0, numberOfFutureEvents))

    return filteredArray
  }

  async getVilles(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('villes')
  }

  async getCollectifs(): Promise<Array<{ nom: string }>> {
    return db.query().select('*').from('collectifs')
  }
}
