import { test } from '@japa/runner'
import { AudienceService } from '#services/audience_service'

test.group('Filter timeline algorithm', () => {
  const service = new AudienceService()

  const mockEvent = (id: number, date: string | null, testProperty?: string) => ({
    id,
    date_de_decision: date ?? undefined,
    degre_de_juridiction: testProperty ?? null,
  })

  test('should return unaltered event objects', async ({ assert }) => {
    const text = 'This text should remain unaltered'
    const timeline = [mockEvent(1, '2020-01-01', text)]
    const result = (service as any).filterTimeline(timeline, 1)
    assert.equal(result[0].id, 1)
    assert.equal(result[0].degre_de_juridiction, text)
    assert.equal(result[0].date_de_decision, '2020-01-01')
  })

  test('should return all events when they are less than 4', ({ assert }) => {
    const timeline = [mockEvent(1, '2024-01-10'), mockEvent(2, '2024-01-20')]
    const result = (service as any).filterTimeline(timeline, 1)
    assert.lengthOf(result, 2)
    assert.equal(result[0].id, 1)
  })

  test('should move the current audience at prefered index (#1)', ({ assert }) => {
    const timeline = [
      mockEvent(1, '2024-01-01'),
      mockEvent(2, '2024-02-01'),
      mockEvent(3, '2024-03-01'),
      mockEvent(4, '2024-04-01'),
      mockEvent(5, '2024-05-01'),
    ]

    const result = (service as any).filterTimeline(timeline, 3)

    assert.lengthOf(result, 4, 'Timeline returned should contain 4 events')
    assert.equal(result[1].id, 3, 'Current audience should be the second item (index 1)')
    assert.equal(
      result[0].id,
      2,
      'Timeline should have 1 past event in the first position(index 0)'
    )
    assert.equal(result[3].id, 5, 'Timeline should contain 2 future events')
  })

  test('should handle when current date is the first event', ({ assert }) => {
    const timeline = [
      mockEvent(1, '2024-01-01'),
      mockEvent(2, '2024-02-01'),
      mockEvent(3, '2024-03-01'),
      mockEvent(4, '2024-04-01'),
      mockEvent(5, '2024-05-01'),
    ]
    const result = (service as any).filterTimeline(timeline, 1)
    assert.lengthOf(result, 4)
    assert.equal(result[0].id, 1, 'Current audience is the first because no past event')
  })

  test('should handle correctly empty dates', ({ assert }) => {
    const timeline = [mockEvent(1, '2024-01-01'), mockEvent(2, null), mockEvent(3, '2023-01-01')]
    const result = (service as any).filterTimeline(timeline, 1)
    assert.equal(result[0].id, 3, '2023 should be first')
    assert.equal(result[2].id, 2, 'Empry date should be the last (year 2199)')
  })

  test('should return 4 events even if current is the last one', ({ assert }) => {
    const timeline = [
      mockEvent(1, '2024-01-01'),
      mockEvent(2, '2024-02-01'),
      mockEvent(3, '2024-03-01'),
      mockEvent(4, '2024-04-01'),
      mockEvent(5, '2024-05-01'),
    ]
    const result = (service as any).filterTimeline(timeline, 5)
    assert.lengthOf(result, 4, 'Should fill with past events if no future events left')
  })

  test('should return 1 event there is only one event', ({ assert }) => {
    const timeline = [mockEvent(1, '2024-01-01')]
    const result = (service as any).filterTimeline(timeline, 1)
    assert.lengthOf(result, 1)
  })
})
