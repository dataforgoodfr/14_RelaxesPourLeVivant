import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chef_prevention_categories'

  async up() {
    this.schema.createView(this.tableName, (view) => {
      view.as(
        this.db
          .knexQuery()
          .distinct(
            this.db.knexRawQuery("string_to_table(chefs_de_prevention_categorie, ',') as intitule")
          )
          .from('audiences')
          .orderBy('intitule')
      )
    })
  }

  async down() {
    this.schema.dropView(this.tableName)
  }
}
