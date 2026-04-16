/**
 * Resulting type of the `searchAudiences` query.
 */
export type TimelineDbResultItem = {
  id: number
  date_de_decision?: string
  degre_de_juridiction?: string
  decision_pour_les_infractions_principales?: string
  type_de_peine_pour_les_infractions_principales?: string
}

/*
 * Timeline item to be rendered in the view, with or without date.
 * Three types :
 * - date des faits (type: 'faits', date: string)
 * - audience with date (type: 'audience', date: string)
 * - audience à venir (type: 'audience_a_venir', date: undefined)
 */
export type TimelineItem =
  | TimelineDateDesFaitsItem
  | TimelineAudienceItem
  | TimelineAudienceAVenirItem

type BaseAudienceItem = {
  id: number
  degre_de_juridiction?: string
  decision_pour_les_infractions_principales?: string
  type_de_peine_pour_les_infractions_principales?: string
  skipped_before?: number
  skipped_after?: number
}

export type TimelineAudienceItem = BaseAudienceItem & {
  type: 'audience'
  date: string
}

export type TimelineAudienceAVenirItem = BaseAudienceItem & {
  type: 'audience_a_venir'
  date: null
}

export type TimelineDateDesFaitsItem = {
  type: 'faits'
  date: string
}

/**
 * Filters out timeline for a given maximum number of events,
 * and sorting it ascendant with a preferred position for current audience's date
 */
export class TimelineDataMapper {
  constructor(
    private readonly maximumNumberOfEvents = 4, // date des faits will be first
    private readonly preferredPositionForCurrentAudience = 1
  ) {}

  map(audience: {
    id: number
    date_des_faits: string | null
    timeline: TimelineDbResultItem[]
  }): TimelineItem[] {
    const eventsWithDate: TimelineAudienceItem[] = []
    const eventsWithoutDate: TimelineAudienceAVenirItem[] = []

    // We need to reserve one slot for date des faits if it exists
    const maximumNumberOfEvents = this.maximumNumberOfEvents - (audience.date_des_faits ? 1 : 0)

    /**
     * Build the final timeline with the date des faits at first position if it exists, then the sorted audiences.
     * @param sortedAudiences
     * @returns
     */
    function buildTimeline(
      sortedAudiences: Array<TimelineAudienceItem | TimelineAudienceAVenirItem>
    ): TimelineItem[] {
      const dateDesFaitsItem: TimelineDateDesFaitsItem | null = audience.date_des_faits
        ? {
            type: 'faits',
            date: audience.date_des_faits,
          }
        : null
      if (dateDesFaitsItem) {
        return [dateDesFaitsItem, ...sortedAudiences]
      }
      return [...sortedAudiences]
    }

    for (const item of audience.timeline) {
      if (item.date_de_decision) {
        eventsWithDate.push({
          ...item,
          type: 'audience',
          date: item.date_de_decision,
        })
      } else {
        eventsWithoutDate.push({
          ...item,
          type: 'audience_a_venir',
          date: null,
        })
      }
    }

    eventsWithDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    eventsWithoutDate.sort((a, b) => Number(a.id) - Number(b.id))

    const sortedTimeline = [...eventsWithDate, ...eventsWithoutDate]

    // When total events < maximum number of events, early return of sorted dates
    if (sortedTimeline.length <= maximumNumberOfEvents) {
      return buildTimeline(sortedTimeline)
    }

    // Splitting sortedTimeline into 3 groups (pasts, current, futures)
    const currentIndex = sortedTimeline.findIndex((t) => Number(t.id) === audience.id)

    // Maximum number of events > complete timeline, audience is not present in the timeline, we return the most recent events trimmed to the maximum number of events
    if (currentIndex === -1) {
      const trimmedSize = sortedTimeline.length - maximumNumberOfEvents
      sortedTimeline[maximumNumberOfEvents - 1].skipped_after = trimmedSize
      return buildTimeline(sortedTimeline.slice(0, maximumNumberOfEvents))
    }

    const currentEvent = sortedTimeline[currentIndex]
    const pastEvents = sortedTimeline.slice(0, currentIndex)
    const futureEvents = sortedTimeline.slice(currentIndex + 1)

    // Defining number of items per group according to preferences
    let numberOfPastEvents = Math.min(this.preferredPositionForCurrentAudience, pastEvents.length)
    const numberOfFutureEvents = Math.min(
      futureEvents.length,
      maximumNumberOfEvents - (1 + numberOfPastEvents)
    )
    if (numberOfPastEvents + numberOfFutureEvents !== maximumNumberOfEvents - 1) {
      numberOfPastEvents = Math.min(
        pastEvents.length,
        maximumNumberOfEvents - 1 - numberOfFutureEvents
      )
    }

    const pastEventsStartIndex = pastEvents.length - numberOfPastEvents
    const trimmedBeforePastEvents = pastEventsStartIndex
    if (trimmedBeforePastEvents > 0) {
      pastEvents[pastEventsStartIndex].skipped_before = trimmedBeforePastEvents
    }
    const futureEventsEndIndex = numberOfFutureEvents
    const trimmedAfterFutureEvents = futureEvents.length - numberOfFutureEvents
    if (trimmedAfterFutureEvents > 0) {
      futureEvents[futureEventsEndIndex - 1].skipped_after = trimmedAfterFutureEvents
    }

    return buildTimeline([
      ...pastEvents.slice(pastEventsStartIndex),
      currentEvent,
      ...futureEvents.slice(0, futureEventsEndIndex),
    ])
  }
}
