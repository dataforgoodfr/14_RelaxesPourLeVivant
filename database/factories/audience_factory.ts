import factory from '@adonisjs/lucid/factories'
import Audience from '#models/audience'
import { DateTime } from 'luxon'
import { VilleFactory } from './ville_factory.js'

export const AudienceFactory = factory
  .define(Audience, async ({ faker }) => {
    return {
      date_de_l_audience: DateTime.fromJSDate(faker.date.past()),
      juridiction: faker.helpers.arrayElement([
        'Tribunal de police',
        'Tribunal correctionnel',
        'Cour d’appel',
        'Cour de cassation',
      ]),
      date_de_decision: DateTime.fromJSDate(faker.date.past()),
      decision_pour_les_faits: faker.helpers.arrayElement(['Condamnable', 'Relaxe']),
      decision_pour_les_infractions: faker.helpers.arrayElement(['Condamnable', 'Relaxe']),
      numero_de_chambre: faker.number.int({ min: 0, max: 10 }),
      nombre_de_prevenu_es: faker.number.int({ min: 0, max: 10 }),
      nombre_de_temoins: faker.number.int({ min: 0, max: 10 }),
      expertise_des_temoins: faker.helpers
        .multiple(faker.person.jobTitle, { count: { min: 1, max: 10 } })
        .join(', '),
      nombre_d_avocat_es: faker.number.int({ min: 0, max: 10 }),
      nom_des_parties_civiles: faker.word.words(2),
      demande_des_parties_civiles: faker.lorem.lines(),
      composition_du_tribunal: faker.helpers.arrayElement(['Juge unique', 'Formation collégiale']),
      fondement_de_la_relaxe: faker.helpers.arrayElement([
        'Infraction non caractérisée',
        'Etat de nécessité',
        'Liberté d’expression',
      ]),
      peine_pour_les_faits: faker.lorem.lines(),
      detail_de_la_peine: faker.lorem.paragraph(),
      score_de_la_gravite: faker.number.int({ min: 0, max: 5 }),
      peine_complementaire: faker.lorem.lines(),
      peine_pour_les_infractions: faker.lorem.lines(),
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
      recit_d_audience: faker.system.filePath(),
      decision: faker.system.filePath(),
      resume_du_jugement_ou_arret: faker.lorem.paragraph(),
    }
  })
  .relation('ville', () => VilleFactory)
  .build()
