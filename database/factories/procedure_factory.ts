import Procedure from '#models/procedure'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { AudienceFactory } from './audience_factory.js'

export const ProcedureFactory = factory
  .define(Procedure, async ({ faker }) => {
    return {
      reference_procedure: faker.lorem.words(),
      titre: faker.lorem.sentence(),
      date_des_faits: DateTime.fromJSDate(faker.date.past()),
      faits_concis: faker.lorem.paragraph(),
      faits_detailles: faker.lorem.paragraphs(),
      poursuites: faker.lorem.words(),
      la_presse_parle_des_faits: faker.internet.url(),
      publiee: faker.datatype.boolean(),
    }
  })
  .state('publiee', (user) => {
    user.publiee = true
  })
  .state('draft', (user) => {
    user.publiee = false
  })
  .relation('audiences', () => AudienceFactory)
  .build()
