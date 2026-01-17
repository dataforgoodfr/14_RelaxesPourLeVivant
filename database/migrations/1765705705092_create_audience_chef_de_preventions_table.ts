import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audience_chef_de_preventions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('audience_id').unsigned().references('audiences.id')
      table.integer('chef_de_prevention_id').unsigned().references('chef_de_preventions.id')
      table.unique(['audience_id', 'chef_de_prevention_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
