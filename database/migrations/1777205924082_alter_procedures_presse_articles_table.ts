import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures_presse_articles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('reference_procedure')
    })

    this.schema.raw(
      'UPDATE procedures_presse_articles SET reference_procedure = procedures.reference_procedure FROM procedures WHERE procedures_presse_articles.procedure_id = procedures.id'
    )

    this.schema.alterTable(this.tableName, (table) => {
      table.string('reference_procedure').notNullable().alter()
      table.dropColumn('procedure_id')
      table
        .foreign('reference_procedure')
        .references('reference_procedure')
        .inTable('procedures')
        .onDelete('CASCADE')
      table.unique(['reference_procedure', 'presse_article_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('procedure_id').unsigned()
    })
    this.schema.raw(
      'UPDATE procedures_presse_articles SET procedure_id = procedures.id FROM procedures WHERE procedures_presse_articles.reference_procedure = procedures.reference_procedure'
    )
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('procedure_id').notNullable().alter()
      table.dropColumn('reference_procedure')
      table.foreign('procedure_id').references('id').inTable('procedures').onDelete('CASCADE')
      table.unique(['procedure_id', 'presse_article_id'])
    })
  }
}
