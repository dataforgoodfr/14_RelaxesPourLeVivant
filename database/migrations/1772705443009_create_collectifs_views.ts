import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collectifs'

  async up() {
    this.schema.createView(this.tableName, (view) => {
      view.as(
        this.db
          .knexQuery()
          .distinct(
            this.db.knexRawQuery("string_to_table(collectif_d_action_ou_lutte, ',') as nom")
          )
          .from('procedures')
          .orderBy('nom')
      )
    })
  }

  async down() {
    this.schema.dropView(this.tableName)
  }
}
