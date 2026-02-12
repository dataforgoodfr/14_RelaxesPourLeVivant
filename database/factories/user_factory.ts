import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: '1234',
      motivation: faker.lorem.sentence(),
      approved: faker.datatype.boolean(),
    }
  })
  .build()
