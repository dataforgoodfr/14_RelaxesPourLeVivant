import Procedure from '#models/procedure'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { AudienceFactory } from './audience_factory.js'
import { PresseArticleFactory } from './presse_article_factory.js'

export const ProcedureFactory = factory
  .define(Procedure, async ({ faker }) => {
    return {
      reference_procedure: faker.lorem.words(),
      titre: faker.lorem.sentence(),
      date_des_faits: DateTime.fromJSDate(faker.date.past()),
      faits_concis: faker.lorem.paragraph(),
      faits_detailles: faker.lorem.paragraphs(),
      poursuites: faker.lorem.words(),
      collectif_d_action_ou_lutte: faker.helpers.multiple(() => faker.company.name(), {
        count: {
          min: 1,
          max: 2,
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
  .relation('audiences', () => AudienceFactory)
  .relation('la_presse_parle_des_faits', () => PresseArticleFactory)
  .build()
