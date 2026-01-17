import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Collectif extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nom: string
}
