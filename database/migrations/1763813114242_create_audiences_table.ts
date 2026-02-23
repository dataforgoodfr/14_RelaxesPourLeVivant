import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Relation fields
      table
        .string('nom_de_la_procedure')
        .notNullable()
        .references('procedures.nom')
        .onDelete('CASCADE')

      // Public fields
      table.date('date_de_l_audience')
      table.string('ville_de_l_audience').references('villes.nom')
      table.string('juridiction')
      table.date('date_de_decision')
      table.string('decision_pour_les_faits')
      table.string('decision_pour_les_infractions')

      // Restricted fields
      table.string('numero_de_chambre')
      table.integer('nombre_de_prevenu_es').unsigned().defaultTo(0).notNullable()
      table.integer('nombre_de_temoins').unsigned().defaultTo(0).notNullable()
      table.text('expertise_des_temoins')
      table.integer('nombre_d_avocat_es').unsigned().defaultTo(0).notNullable()
      table.text('nom_des_parties_civiles')
      table.text('demande_des_parties_civiles')
      table.string('composition_du_tribunal')
      table.string('fondement_de_la_relaxe')
      table.text('peine_pour_les_faits')
      table.text('detail_de_la_peine')
      table.integer('score_de_la_gravite').unsigned()
      table.text('peine_complementaire')
      table.text('peine_pour_les_infractions')
      table.boolean('appel_d_une_des_parties')
      table.string('partie_de_l_appel_principal')
      table.string('partie_de_l_appel_incident')
      table.string('recit_d_audience')
      table.string('decision')
      table.text('resume_du_jugement_ou_arret')

      table.boolean('publiee').defaultTo(true).notNullable()
      table.index('publiee')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
