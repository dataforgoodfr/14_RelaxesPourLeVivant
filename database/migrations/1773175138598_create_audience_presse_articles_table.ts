import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences_presse_articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('audience_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('audiences')
        .onDelete('CASCADE')

      table
        .integer('presse_article_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('presse_articles')
        .onDelete('CASCADE')

      table.unique(['audience_id', 'presse_article_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
