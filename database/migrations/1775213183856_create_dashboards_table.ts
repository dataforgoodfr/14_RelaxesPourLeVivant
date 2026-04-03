import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dashboards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('metabase_id').notNullable()
      table.string('titre').notNullable()
      table.boolean('publiee').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
