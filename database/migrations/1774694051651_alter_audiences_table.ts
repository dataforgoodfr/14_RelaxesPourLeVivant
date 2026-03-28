import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD COLUMN chefs_de_prevention_categorie_searchable text[] GENERATED ALWAYS AS (string_to_array(chefs_de_prevention_categorie,',')) STORED;`
    )
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('chefs_de_prevention_categorie_searchable')
    })
  }
}
