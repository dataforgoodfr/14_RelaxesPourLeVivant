import factory from '@adonisjs/lucid/factories'
import Collectif from '#models/collectif'

export const CollectifFactory = factory
  .define(Collectif, async ({ faker }) => {
    return {
      nom: faker.word.words(3),
    }
  })
  .build()
