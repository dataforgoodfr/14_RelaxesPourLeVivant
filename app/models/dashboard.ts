import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Dashboard extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare metabaseId: number

  @column()
  declare titre: string

  @column()
  declare publiee: boolean
}
