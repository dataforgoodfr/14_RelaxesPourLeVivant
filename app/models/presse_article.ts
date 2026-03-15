import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PresseArticle extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare titre: string

  @column()
  declare url: string
}
