import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nom').unique()

      // Public fields
      table.text('courte_description')

      // Private fields
      table.date('date_des_faits')
      table.text('description')
      table.text('poursuites')
      table.string('nom_des_parties_civiles')
      table.string('la_presse_parle_des_faits')
      table.string('collectif_d_action_ou_lutte').references('collectifs.nom')

      table.boolean('publiee').defaultTo(true).notNullable()
      table.index('publiee')

      this.schema.raw(
        "ALTER TABLE procedures ADD COLUMN description_searchable tsvector GENERATED ALWAYS AS (to_tsvector('french', coalesce(description, ''))) STORED;"
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
