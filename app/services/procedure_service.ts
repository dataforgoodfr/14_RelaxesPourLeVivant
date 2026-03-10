import Procedure from '#models/procedure'

export class ProcedureService {
  /**
   * Get a procedure from an audience if both the audience and its procedure are published.
   * Load only the audiences that are published.
   * The audiences are sorted by date of the audience, from the oldest to the most recent.
   * @param id
   * @returns
   * @throws E_ROW_NOT_FOUND
   */
  async getProcedureWithAudiencesPubliees(audienceId: number) {
    return Procedure.query()
      .whereHas('audiences', (query) => {
        query.where('id', audienceId).andWhere('publiee', true)
      })
      .andWhere('publiee', true)
      .preload('audiences', (query) => {
        query
          .where('publiee', true)
          .orderBy('date_de_l_audience', 'asc')
          .preload('la_presse_parle_du_proces')
      })
      .preload('la_presse_parle_des_faits')
      .firstOrFail()
  }
}
