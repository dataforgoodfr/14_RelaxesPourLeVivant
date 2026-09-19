import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences_presse_articles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['audience_id', 'presse_article_id'])
      table.primary(['audience_id', 'presse_article_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropPrimary()
      table.unique(['audience_id', 'presse_article_id'])
    })
  }
}
