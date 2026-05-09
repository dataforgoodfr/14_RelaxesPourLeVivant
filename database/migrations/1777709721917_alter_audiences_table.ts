import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD COLUMN fondement_de_la_relaxe_searchable tsvector GENERATED ALWAYS AS (to_tsvector('french', coalesce(fondement_de_la_relaxe, ''))) STORED;`
    )
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD COLUMN chefs_de_prevention_categorie_text_searchable tsvector GENERATED ALWAYS AS (to_tsvector('french', coalesce(chefs_de_prevention_categorie, ''))) STORED;`
    )
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fondement_de_la_relaxe_searchable')
      table.dropColumn('chefs_de_prevention_categorie_text_searchable')
    })
  }
}
