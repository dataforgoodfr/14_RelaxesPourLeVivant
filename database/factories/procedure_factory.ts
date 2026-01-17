import factory from '@adonisjs/lucid/factories'
import Procedure from '#models/procedure'
import { DateTime } from 'luxon'
import { AudienceFactory } from './audience_factory.js'

export const ProcedureFactory = factory
  .define(Procedure, async ({ faker }) => {
    return {
      nom: faker.string.alpha({ length: 80 }),
      date_des_faits: DateTime.fromJSDate(faker.date.past()),
      courte_description: faker.lorem.paragraph(),
      description: faker.lorem.paragraphs(),
      poursuites: faker.lorem.words(),
      nom_des_parties_civiles: faker.word.words(3),
      la_presse_parle_des_faits: faker.internet.url(),
    }
  })
  .relation('audiences', () => AudienceFactory)
  .build()
