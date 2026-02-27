import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('reference_procedure').notNullable().unique()

      // Public fields
      table.text('faits_concis')

      // Private fields
      table.string('titre').notNullable()
      table.text('date_des_faits')  // or type "list of date"
      table.text('faits_detailles')
      table.text('poursuites')
      table.string('la_presse_parle_des_faits')  // .references to a table "presse_article" ?
      table.string('collectif_d_action_ou_lutte').references('collectifs.nom')

      table.boolean('publiee').defaultTo(true).notNullable()
      table.index('publiee')

      this.schema.raw(
        "ALTER TABLE procedures ADD COLUMN faits_detailles_searchable tsvector GENERATED ALWAYS AS (to_tsvector('french', coalesce(faits_detailles, ''))) STORED;"
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
