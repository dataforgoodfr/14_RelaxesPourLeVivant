import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'utilisateurs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('password_token').nullable()
      table.timestamp('password_token_created_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('password_token', 'password_token_created_at')
    })
  }
}
