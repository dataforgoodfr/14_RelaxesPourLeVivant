import {
  type TimelineAudienceAVenirItem,
  type TimelineAudienceItem,
  TimelineDataMapper,
} from '#controllers/mappers/timeline_mapper'
import type { SearchAudiencesResponse } from '#services/audience_service'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Timeline mapper algorithm', () => {
  const timelineDataMapper = new TimelineDataMapper()

  const mockEvent = (
    id: number,
    date_de_decision: DateTime | null = null,
    degre_de_juridiction: string | null = null,
    decision_pour_les_infractions_principales: string | null = null,
    juridiction: string | null = null,
    type_de_peine_pour_les_infractions_principales: string | null = null
  ): SearchAudiencesResponse[number]['timeline'][number] => ({
    id,
    date_de_decision,
    degre_de_juridiction,
    decision_pour_les_infractions_principales,
    juridiction,
    type_de_peine_pour_les_infractions_principales,
    publiee: true,
  })

  test('should return unaltered event data', async ({ assert }) => {
    const text = 'This text should remain unaltered'
    const timeline = [mockEvent(1, DateTime.fromISO('2020-01-01'), text)]
    const result = timelineDataMapper.map({ timeline, id: 1, date_des_faits: null })
    assert.equal(result[0].type, 'audience')
    assert.equal((result[0] as TimelineAudienceItem).id, 1)
    assert.equal((result[0] as TimelineAudienceItem).degre_de_juridiction, text)
    assert.isTrue((result[0] as TimelineAudienceItem).date.equals(DateTime.fromISO('2020-01-01')))
  })

  test('should return all events when they are less than maximumNumberOfEvents', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-10')),
      mockEvent(2, DateTime.fromISO('2024-01-20')),
    ]
    const result = timelineDataMapper.map({ timeline, id: 1, date_des_faits: null })
    assert.lengthOf(result, 2)
    assert.equal((result[0] as TimelineAudienceItem).id, 1)
  })

  test('should move the current audience at prefered index (#1)', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2024-02-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2024-04-01')),
      mockEvent(5, DateTime.fromISO('2024-05-01')),
    ]

    const result = timelineDataMapper.map({ timeline, id: 3, date_des_faits: null })

    assert.lengthOf(result, 4, 'Timeline returned should contain 4 events')
    assert.equal(result[1].type, 'audience', 'Current audience should be a TimelineAudienceItem')
    assert.equal(
      (result[1] as TimelineAudienceItem).id,
      3,
      'Current audience should be the second item (index 1)'
    )
    assert.equal(result[0].type, 'audience', 'Past audience should be a TimelineAudienceItem')
    assert.equal(
      (result[0] as TimelineAudienceItem).id,
      2,
      'Timeline should have 1 past event in the first position(index 0)'
    )
    assert.equal(result[2].type, 'audience', 'Future audience should be a TimelineAudienceItem')
    assert.equal(
      (result[2] as TimelineAudienceItem).id,
      4,
      'Timeline should contain 1 future event in the third position (index 2)'
    )
    assert.equal(result[3].type, 'audience', 'Future audience should be a TimelineAudienceItem')
    assert.equal(
      (result[3] as TimelineAudienceItem).id,
      5,
      'Timeline should contain 1 future event in the fourth position (index 3)'
    )
  })

  test('should handle when current date is the first event', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2024-02-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2024-04-01')),
      mockEvent(5, DateTime.fromISO('2024-05-01')),
    ]
    const result = timelineDataMapper.map({ timeline, id: 1, date_des_faits: null })
    assert.lengthOf(result, 4)

    assert.equal(result[0].type, 'audience', 'Current audience should be a TimelineAudienceItem')
    assert.equal(
      (result[0] as TimelineAudienceItem).id,
      1,
      'Current audience is the first because no past event'
    )
  })

  test('should handle correctly empty dates', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2),
      mockEvent(3, DateTime.fromISO('2023-01-01')),
    ]
    const result = timelineDataMapper.map({ timeline, id: 1, date_des_faits: null })
    assert.lengthOf(result, 3)
    assert.equal(result[0].type, 'audience', 'First item should be a TimelineAudienceItem')
    assert.equal((result[0] as TimelineAudienceItem).id, 3, '2023 should be first')
    assert.equal(
      result[2].type,
      'audience_a_venir',
      'Last item should be a TimelineAudienceAVenirItem'
    )
    assert.equal((result[2] as TimelineAudienceAVenirItem).id, 2, 'Empry date should be the last')
  })

  test('should return 4 events even if current is the last one', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2024-02-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2024-04-01')),
      mockEvent(5, DateTime.fromISO('2024-05-01')),
    ]
    const result = timelineDataMapper.map({ timeline, id: 5, date_des_faits: null })
    assert.lengthOf(result, 4, 'Should fill with past events if no future events left')
  })

  test('should return 1 event there is only one event and no date des faits', ({ assert }) => {
    const timeline = [mockEvent(1, DateTime.fromISO('2024-01-01'))]
    const result = timelineDataMapper.map({ timeline, id: 1, date_des_faits: null })
    assert.lengthOf(result, 1)
  })

  test('should add date des faits at first position if provided', ({ assert }) => {
    const timeline = [mockEvent(1, DateTime.fromISO('2024-01-10'))]
    const result = timelineDataMapper.map({
      timeline,
      id: 1,
      date_des_faits: DateTime.fromISO('2019-01-01'),
    })
    assert.lengthOf(result, 2)
    assert.equal(result[0].type, 'faits')
    assert.isTrue(result[0].date!.equals(DateTime.fromISO('2019-01-01')))
    assert.equal(result[1].type, 'audience')
    assert.equal((result[1] as TimelineAudienceItem).id, 1)
  })

  test('should return 4 events max when date des faits is provided', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2024-02-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2024-04-01')),
      mockEvent(5, DateTime.fromISO('2024-05-01')),
    ]
    const result = timelineDataMapper.map({
      timeline,
      id: 4,
      date_des_faits: DateTime.fromISO('2019-01-01'),
    })
    assert.lengthOf(result, 4, 'Should trim to maximumNumberOfEvents')
    assert.equal(result[0].type, 'faits', 'First item should be date des faits')
    assert.isTrue(
      result[0].date!.equals(DateTime.fromISO('2019-01-01')),
      'Date des faits should be correct'
    )
    assert.equal(result[1].type, 'audience', 'Second item should be a past TimelineAudienceItem')
    assert.equal(
      (result[1] as TimelineAudienceItem).id,
      3,
      'Most recent past event should be in second position'
    )
    assert.equal(
      result[2].type,
      'audience',
      'Third item should be the current TimelineAudienceItem'
    )
    assert.equal(
      (result[2] as TimelineAudienceItem).id,
      4,
      'Third item should be the current event'
    )
    assert.equal(result[3].type, 'audience', 'Fourth item should be a future TimelineAudienceItem')
    assert.equal(
      (result[3] as TimelineAudienceItem).id,
      5,
      'Most recent future event should be in fourth position'
    )
  })

  test('should add skipped_before and skipped_after count when audiences are skipped', ({
    assert,
  }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2024-02-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2024-04-01')), //current audience
      mockEvent(5, DateTime.fromISO('2024-05-01')),
      mockEvent(6, DateTime.fromISO('2024-06-01')),
      mockEvent(7, DateTime.fromISO('2024-07-01')),
      mockEvent(8, DateTime.fromISO('2024-08-01')),
    ]
    const result = timelineDataMapper.map({
      timeline,
      id: 4,
      date_des_faits: DateTime.fromISO('2019-01-01'),
    })
    assert.lengthOf(result, 4, 'Should trim to maximumNumberOfEvents')
    assert.equal(result[0].type, 'faits', 'First item should be date des faits')
    assert.equal(result[1].type, 'audience', 'Second item should be a past TimelineAudienceItem')
    assert.equal(
      (result[1] as TimelineAudienceItem).skipped_before,
      2,
      'Second item should have skipped_before with the number of past events skipped'
    )
    assert.equal(
      result[2].type,
      'audience',
      'Third item should be the current TimelineAudienceItem'
    )
    assert.equal(
      (result[2] as TimelineAudienceItem).id,
      4,
      'Third item should be the current event'
    )
    assert.equal(
      (result[3] as TimelineAudienceItem).id,
      5,
      'Most recent future event should be in fourth position'
    )
    assert.equal(
      (result[3] as TimelineAudienceItem).skipped_after,
      3,
      'Fourth item should have skipped_after with the number of future events skipped'
    )
  })

  test('should return older events first if current audience is not present', ({ assert }) => {
    const timeline = [
      mockEvent(1, DateTime.fromISO('2024-01-01')),
      mockEvent(2, DateTime.fromISO('2025-05-01')),
      mockEvent(3, DateTime.fromISO('2024-03-01')),
      mockEvent(4, DateTime.fromISO('2026-02-01')),
      mockEvent(5, DateTime.fromISO('2024-04-01')),
    ]
    const result = timelineDataMapper.map({
      timeline,
      id: 99,
      date_des_faits: DateTime.fromISO('2019-01-01'),
    })
    assert.lengthOf(result, 4, 'Should trim to maximumNumberOfEvents')
    assert.equal(result[0].type, 'faits', 'First item should be date des faits')
    assert.equal(result[1].type, 'audience', 'Second item should be a TimelineAudienceItem')
    assert.equal(
      (result[1] as TimelineAudienceItem).id,
      1,
      'Second item should be the older past event'
    )
    assert.equal(result[2].type, 'audience', 'Third item should be a TimelineAudienceItem')
    assert.equal(
      (result[2] as TimelineAudienceItem).id,
      3,
      'Third item should be the second older past event'
    )
    assert.equal(result[3].type, 'audience', 'Last item should be a TimelineAudienceItem')
    assert.equal(
      (result[3] as TimelineAudienceItem).id,
      5,
      'Fourth item should be the third older past event'
    )
    assert.equal(
      (result[3] as TimelineAudienceItem).skipped_after,
      2,
      'Fourth item should have skipped_after with the number of future events skipped'
    )
  })
})
