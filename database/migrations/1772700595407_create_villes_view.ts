import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'villes'

  async up() {
    this.schema.createView(this.tableName, (view) => {
      view.as(this.db.knexQuery().distinct('ville_de_l_audience as nom').from('audiences'))
    })
  }

  async down() {
    this.schema.dropView(this.tableName)
  }
}
