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
      table.text('ville_de_l_audience')
      table.text('juridiction')
      table.text('degre_de_juridiction')
      table.date('date_de_decision')
      table.text('details_de_la_decision_pour_les_infractions_principales')
      table.text('decision_pour_les_infractions_principales')

      // Restricted fields
      table.string('numero_de_chambre')
      table.text('chefs_de_prevention_categorie')
      table.text('chefs_de_prevention_sous_categorie')
      table.integer('nombre_de_prevenus')
      table.text('plaidoirie_de_la_defense')
      table.text('noms_des_parties_civiles')
      table.text('demande_des_parties_civiles')
      table.text('requisitions')
      table.text('fondement_de_la_relaxe')
      table.text('type_de_peine_pour_les_infractions_principales')
      table.text('details_des_peines_pour_les_infractions_principales')
      table.text('decision_et_peines_pour_les_infractions_subies_ou_incidentes')
      table.decimal('score_de_la_gravite').unsigned()
      table.boolean('dommages_et_interets')
      table.text('detail_des_dommages_et_interets')
      table.text('inscription_au_casier_judiciaire')
      table.boolean('appel_d_une_des_parties')
      table.string('partie_de_l_appel_principal')
      table.string('partie_de_l_appel_incident')
      table.text('la_presse_parle_du_proces')
      table.text('recit_d_audience') // file
      table.text('jugement_ou_arret') // file
      table.text('reference_de_la_decision')
      table.text('resume_du_jugement_ou_arret')
      table.text('resume_de_l_audience')
      table.text('commentaire_msde')
      table.text('extrait_de_la_decision')
      table.text('mots_cles')

      table.boolean('publiee').defaultTo(true).notNullable()
      table.index('publiee')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
