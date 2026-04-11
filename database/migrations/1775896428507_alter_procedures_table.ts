import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('date_des_faits').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('date_des_faits').alter()
    })
  }
}
