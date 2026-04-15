import { ProcedureFactory } from '#database/factories/procedure_factory'
import { AudienceService } from '#services/audience_service'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Search audiences', () => {
  const services = new AudienceService()
  test('search all audiences', async ({ assert }) => {
    await ProcedureFactory.apply('publiee')
      .with('audiences', 1, (audience) => audience.apply('publiee'))
      .create()

    const result = await services.searchAudiences({})

    assert.properties(result.at(0), [
      'appel_d_une_des_parties',
      'chefs_de_prevention_categorie',
      'chefs_de_prevention_sous_categorie',
      'collectif_d_action_ou_lutte',
      'commentaire_msde',
      'date_de_decision',
      'date_de_l_audience',
      'date_des_faits',
      'decision_et_peines_pour_les_infractions_subies_ou_incidentes',
      'decision_pour_les_infractions_principales',
      'degre_de_juridiction',
      'demande_des_parties_civiles',
      'detail_des_dommages_et_interets',
      'details_de_la_decision_pour_les_infractions_principales',
      'details_des_peines_pour_les_infractions_principales',
      'dommages_et_interets',
      'extrait_de_la_decision',
      'faits_concis',
      'faits_detailles',
      'fondement_de_la_relaxe',
      'id',
      'inscription_au_casier_judiciaire',
      'jugement_ou_arret',
      'juridiction',
      'mots_cles',
      'nombre_de_prevenus',
      'noms_des_parties_civiles',
      'numero_de_chambre',
      'partie_de_l_appel_incident',
      'partie_de_l_appel_principal',
      'plaidoirie_de_la_defense',
      'publiee',
      'recit_d_audience',
      'reference_de_la_decision',
      'reference_procedure',
      'requisitions',
      'resume_de_l_audience',
      'resume_du_jugement_ou_arret',
      'score_de_la_gravite',
      'timeline',
      'titre',
      'type_de_peine_pour_les_infractions_principales',
      'ville_de_l_audience',
    ])

    assert.isTrue(DateTime.isDateTime(result.at(0)?.date_des_faits))
    assert.isTrue(DateTime.isDateTime(result.at(0)?.date_de_l_audience))
    assert.isTrue(DateTime.isDateTime(result.at(0)?.date_de_decision))
    assert.isArray(result.at(0)?.mots_cles)
    assert.isArray(result.at(0)?.chefs_de_prevention_categorie)
    assert.isArray(result.at(0)?.collectif_d_action_ou_lutte)

    assert.isArray(result.at(0)?.timeline)
    assert.isTrue(DateTime.isDateTime(result.at(0)?.timeline.at(0)?.date_de_decision))

    assert.equal(result.total, 1)
    assert.equal(result.lastPage, 1)
    assert.equal(result.currentPage, 1)
    assert.equal(result.perPage, 50)
    assert.equal(result.firstPage, 1)
  })
})
