import Configuration from '#models/configuration'

export class ConfigurationService {
  /**
   * This value define the question id of the metabase question used to display the audience graphique.
   */
  async audienceGraphique() {
    const config = await Configuration.findBy('name', 'audience_graphique')
    const questionId = config ? Number.parseInt(config.value) : null
    return Number.isInteger(questionId) ? questionId : null
  }
}
