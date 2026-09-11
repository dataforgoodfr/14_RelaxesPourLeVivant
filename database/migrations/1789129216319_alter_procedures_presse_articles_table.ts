import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures_presse_articles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['reference_procedure', 'presse_article_id'])
      table.primary(['reference_procedure', 'presse_article_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropPrimary()
      table.unique(['reference_procedure', 'presse_article_id'])
    })
  }
}
