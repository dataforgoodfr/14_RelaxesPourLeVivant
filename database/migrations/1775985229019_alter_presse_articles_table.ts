import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'presse_articles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('url').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('url').alter()
    })
  }
}
