import Audience from '#models/audience'

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
}
