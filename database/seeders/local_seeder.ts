import { ProcedureFactory } from '#database/factories/procedure_factory'
import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ProcedureFactory.createMany(4)

    await UserFactory.createMany(4)
    await UserFactory.apply('approved')
      .merge({
        email: 'admin@relaxe.local',
        password: '1234',
      })
      .create()
  }
}
