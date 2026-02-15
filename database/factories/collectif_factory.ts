import Collectif from '#models/collectif'
import factory from '@adonisjs/lucid/factories'

export const CollectifFactory = factory
  .define(Collectif, async ({ faker }) => {
    return {
      nom: faker.company.name(),
    }
  })
  .build()
