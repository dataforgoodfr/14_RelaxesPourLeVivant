import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn(
        'decision_et_peines_pour_les_infractions_subies_ou_incidentes',
        'decision_peines_infractions_subies'
      )
      table.renameColumn(
        'details_de_la_decision_pour_les_infractions_principales',
        'details_decision_infractions_principales'
      )
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn(
        'decision_peines_infractions_subies',
        'decision_et_peines_pour_les_infractions_subies_ou_incidentes'
      )
      table.renameColumn(
        'details_decision_infractions_principales',
        'details_de_la_decision_pour_les_infractions_principales'
      )
    })
  }
}
