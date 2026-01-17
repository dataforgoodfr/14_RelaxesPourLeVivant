import { CollectifFactory } from '#database/factories/collectif_factory'
import { ProcedureFactory } from '#database/factories/procedure_factory'
import { UserFactory } from '#database/factories/user_factory'
import { VilleFactory } from '#database/factories/ville_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomInt } from 'node:crypto'

export default class extends BaseSeeder {
  async run() {
    const villes = await VilleFactory.createMany(100)
    const collectifs = await CollectifFactory.createMany(25)

    await ProcedureFactory.merge({
      collectif_d_action_ou_lutte: collectifs.at(randomInt(collectifs.length - 1))?.nom,
    })
      .with('audiences', 5, (audience) =>
        audience.merge({ ville_de_l_audience: villes.at(randomInt(villes.length - 1))?.nom })
      )
      .createMany(50)

    await UserFactory.createMany(4)
  }
}
