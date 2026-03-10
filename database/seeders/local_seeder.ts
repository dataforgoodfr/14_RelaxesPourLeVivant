import { ProcedureFactory } from '#database/factories/procedure_factory'
import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ProcedureFactory.with('audiences', 5, (audience) =>
      audience.with('la_presse_parle_du_proces', 2)
    )
      .with('la_presse_parle_des_faits', 2)
      .createMany(50)

    await UserFactory.createMany(4)
    await UserFactory.apply('approved')
      .merge({
        email: 'admin@relaxe.local',
        password: '1234',
      })
      .create()
  }
}
