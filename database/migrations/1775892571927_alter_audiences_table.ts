import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.setNullable('reference_procedure')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropNullable('reference_procedure')
    })
  }
}
