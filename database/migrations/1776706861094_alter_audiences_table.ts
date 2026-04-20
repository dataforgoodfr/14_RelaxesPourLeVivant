import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('reference_procedure')
      table
        .string('reference_procedure')
        .references('procedures.reference_procedure')
        .onDelete('SET NULL')
        .alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('reference_procedure')
      table
        .string('reference_procedure')
        .notNullable()
        .references('procedures.reference_procedure')
        .onDelete('CASCADE')
        .alter()
    })
  }
}
