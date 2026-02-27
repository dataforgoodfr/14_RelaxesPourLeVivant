import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audiences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Relation fields
      table
        .string('reference_procedure')
        .notNullable()
        .references('procedures.reference_procedure')
        .onDelete('CASCADE')

      // Public fields
      table.date('date_de_l_audience')
      table.string('ville_de_l_audience').references('villes.nom')
      table.string('juridiction')  // TODO : create table juridiction and reference it here
      table.string('degre_de_juridiction')  // TODO : create table degre_de_juridiction and reference it here
      table.date('date_de_decision')
      table.text('details_de_la_decision_pour_les_infractions_principales')
      table.string('decision_pour_les_infractions_principales')  // TODO : link to table with values

      // Restricted fields
      table.string('numero_de_chambre')
      table.integer('nombre_de_prevenus')
      table.text('plaidoirie_de_la_defense')
      table.text('noms_des_parties_civiles')
      table.text('demande_des_parties_civiles')
      table.text('requisitions')
      table.string('fondement_de_la_relaxe')  // Todo : create a table with value, multiple choices
      table.string('type_de_peine_pour_les_infractions_principales')  // Todo : create a table with value, multiple choices
      table.text('details_des_peines_pour_les_infractions_principales')
      table.text('decision_et_peines_pour_les_infractions_subies_ou_incidentes')
      table.float('score_de_la_gravite').unsigned()
      table.boolean('dommages_et_interets')
      table.text('detail_des_dommages_et_interets')
      table.boolean('inscription_au_casier_judiciaire')
      table.boolean('appel_d_une_des_parties')
      table.string('partie_de_l_appel_principal')  // TODO : multiple choices
      table.string('partie_de_l_appel_incident')  // TODO : multiple choices
      table.string('la_presse_parle_du_proces')  //  TODO : create table, multiple choices
      table.string('recit_d_audience')  // Todo : change type to file ?
      table.string('jugement_ou_arret')  // Todo : change type to file ?
      table.string('reference_de_la_decision')
      table.text('resume_du_jugement_ou_arret')
      table.text('resume_de_l_audience')
      table.text('commentaire_msde')
      table.text('extrait_de_la_decision')
      table.text('mots_cles')  // TODO : create table, multiple choices

      table.boolean('publiee').defaultTo(true).notNullable()
      table.index('publiee')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
