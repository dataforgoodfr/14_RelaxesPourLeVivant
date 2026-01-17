import factory from '@adonisjs/lucid/factories'
import Ville from '#models/ville'

export const VilleFactory = factory
  .define(Ville, async ({ faker }) => {
    return {
      nom: faker.location.city(),
    }
  })
  .build()
