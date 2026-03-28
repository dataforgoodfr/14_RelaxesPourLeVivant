import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'procedures'

  async up() {
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD COLUMN collectif_d_action_ou_lutte_searchable text[] GENERATED ALWAYS AS (string_to_array(collectif_d_action_ou_lutte,',')) STORED;`
    )
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('collectif_d_action_ou_lutte_searchable')
    })
  }
}
