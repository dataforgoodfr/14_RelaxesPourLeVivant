import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'juridictions'

  async up() {
    this.schema.createView(this.tableName, (view) => {
      view.as(
        this.db
          .knexQuery()
          .distinct('juridiction as intitule')
          .from('audiences')
          .orderBy('intitule')
      )
    })
  }

  async down() {
    this.schema.dropView(this.tableName)
  }
}
