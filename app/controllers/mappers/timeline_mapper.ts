type TimelineItem = {
  id: number
  date_de_decision?: string
  degre_de_juridiction?: string
  decision_pour_les_infractions_principales?: string
  type_de_peine_pour_les_infractions_principales?: string
}

/**
 * Filters out timeline for a given maximum number of events,
 * and sorting it ascendant with a preferred position for current audience's date
 */
export class TimelineDataMapper {
  constructor(
    private readonly maximumNumberOfEvents = 4,
    private readonly preferredPositionForCurrentAudience = 1
  ) {}

  map(audience: { timeline: TimelineItem[]; id: number }) {
    const sortedTimeline = audience.timeline
      .map<TimelineItem & { date_de_decision: string }>((event) => ({
        ...event,
        date_de_decision: event.date_de_decision ?? '2199-12-31',
      }))
      // Sorting dates (ASC)
      .sort(
        (a, b) => new Date(a.date_de_decision).getTime() - new Date(b.date_de_decision).getTime()
      )

    // When total events < maximum number of events, early return of sorted dates
    if (sortedTimeline.length <= this.maximumNumberOfEvents) {
      return sortedTimeline
    }

    // Splitting data into 3 groups (pasts, current, futures)
    const currentIndex = sortedTimeline.findIndex((t) => Number(t.id) === audience.id)

    if (currentIndex === -1) {
      return sortedTimeline.slice(0, this.maximumNumberOfEvents)
    }

    const currentEvent = sortedTimeline[currentIndex]
    const pastEvents = sortedTimeline.slice(0, currentIndex)
    const futureEvents = sortedTimeline.slice(currentIndex + 1)

    // Defining number of items per group according to preferences
    let numberOfPastEvents = Math.min(this.preferredPositionForCurrentAudience, pastEvents.length)
    const numberOfFutureEvents = Math.min(
      futureEvents.length,
      this.maximumNumberOfEvents - (1 + numberOfPastEvents)
    )
    if (numberOfPastEvents + numberOfFutureEvents !== this.maximumNumberOfEvents - 1) {
      numberOfPastEvents = Math.min(
        pastEvents.length,
        this.maximumNumberOfEvents - 1 - numberOfFutureEvents
      )
    }

    return [
      ...pastEvents.slice(pastEvents.length - numberOfPastEvents),
      currentEvent,
      ...futureEvents.slice(0, numberOfFutureEvents),
    ]
  }
}
