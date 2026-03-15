import PresseArticle from '#models/presse_article'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const PresseArticleFactory = factory
  .define(PresseArticle, async ({ faker }) => {
    return {
      titre: `${faker.company.name()} - ${DateTime.fromJSDate(faker.date.recent()).toFormat('dd/MM/yyyy')}`,
      url: faker.internet.url(),
    }
  })
  .build()
