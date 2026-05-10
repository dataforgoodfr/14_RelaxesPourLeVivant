import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD COLUMN titre_searchable tsvector GENERATED ALWAYS AS (to_tsvector('french', coalesce(titre, ''))) STORED;`
    )
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('titre_searchable')
    })
  }
}
