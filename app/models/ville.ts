import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Ville extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string
}
