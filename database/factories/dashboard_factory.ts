import Dashboard from '#models/dashboard'
import factory from '@adonisjs/lucid/factories'

export const DashboardFactory = factory
  .define(Dashboard, async ({ faker }) => {
    return {
      metabaseId: faker.number.int({ min: 1, max: 1000 }),
      titre: faker.lorem.words(3),
      publiee: faker.datatype.boolean(),
    }
  })
  .state('publiee', (dashboard) => {
    dashboard.publiee = true
  })
  .state('draft', (dashboard) => {
    dashboard.publiee = false
  })
  .build()
