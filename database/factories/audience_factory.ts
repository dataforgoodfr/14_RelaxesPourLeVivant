import Audience from '#models/audience'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const AudienceFactory = factory
  .define(Audience, async ({ faker }) => {
    return {
      reference_procedure: faker.lorem.words(),
      date_de_l_audience: DateTime.fromJSDate(faker.date.past()),
      ville_de_l_audience: faker.helpers.arrayElement(['PARIS', 'LYON', 'MARSEILLE']),
      juridiction: faker.helpers.arrayElement([
        'Tribunal de police',
        'Tribunal correctionnel',
        'Cour d’appel',
        'Cour de cassation',
      ]),
      degre_de_juridiction: faker.helpers.arrayElement(['1ere instance', 'Appel', 'Cassation']),
      date_de_decision: DateTime.fromJSDate(faker.date.past()),
      details_de_la_decision_pour_les_infractions_principales: faker.lorem.lines(),
      decision_pour_les_infractions_principales: faker.helpers.arrayElement([
        'Condamnation',
        'Relaxe',
      ]),
      numero_de_chambre: `Chambre correctionnelle n°${faker.number.int({ min: 0, max: 50 })}`,
      chefs_de_prevention_categorie: faker.helpers.multiple(() => faker.word.words(2), {
        count: {
          min: 0,
          max: 2,
        },
      }),
      chefs_de_prevention_sous_categorie: faker.helpers.multiple(() => faker.word.words(4), {
        count: {
          min: 0,
          max: 2,
        },
      }),
      nombre_de_prevenus: faker.number.int({ min: 0, max: 10 }),
      plaidoirie_de_la_defense: faker.lorem.lines(),
      noms_des_parties_civiles: faker.word.words(2),
      demande_des_parties_civiles: faker.lorem.lines(),
      requisitions: faker.lorem.lines(),
      fondement_de_la_relaxe: faker.helpers.arrayElement([
        'Infraction non caractérisée',
        'Etat de nécessité',
        'Liberté d’expression',
      ]),
      type_de_peine_pour_les_infractions_principales: faker.word.words(2),
      details_des_peines_pour_les_infractions_principales: faker.lorem.lines(),
      decision_et_peines_pour_les_infractions_subies_ou_incidentes: faker.lorem.paragraph(),
      score_de_la_gravite: faker.number.float({ min: 0.5, max: 8 }),
      dommages_et_interets: faker.datatype.boolean(),
      detail_des_dommages_et_interets: faker.lorem.lines(),
      inscription_au_casier_judiciaire: faker.datatype.boolean(),
      appel_d_une_des_parties: faker.datatype.boolean(),
      partie_de_l_appel_principal: faker.helpers.arrayElement([
        'Prévenu·e',
        'Parquet',
        'Partie Civile',
      ]),
      partie_de_l_appel_incident: faker.helpers.arrayElement([
        'Prévenu·e',
        'Parquet',
        'Partie Civile',
      ]),
      la_presse_parle_du_proces: faker.internet.url(),
      recit_d_audience: [],
      jugement_ou_arret: [],
      reference_de_la_decision: faker.word.words(3),
      resume_du_jugement_ou_arret: faker.lorem.paragraph(),
      resume_de_l_audience: faker.lorem.paragraph(),
      commentaire_msde: faker.lorem.paragraph(),
      extrait_de_la_decision: faker.lorem.paragraph(),
      mots_cles: faker.helpers.multiple(() => faker.word.words(3), {
        count: {
          min: 0,
          max: 3,
        },
      }),
      publiee: faker.datatype.boolean(),
    }
  })
  .state('publiee', (user) => {
    user.publiee = true
  })
  .state('draft', (user) => {
    user.publiee = false
  })
  .build()
