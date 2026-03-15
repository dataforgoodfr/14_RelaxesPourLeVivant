import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('la_presse_parle_des_faits')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('la_presse_parle_des_faits')
    })
  }
}
