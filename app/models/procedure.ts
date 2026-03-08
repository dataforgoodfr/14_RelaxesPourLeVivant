import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { dbMappers } from '../../database/mappers.js'
import Audience from './audience.js'

export default class Procedure extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reference_procedure: string

  @column()
  declare titre: string

  @hasMany(() => Audience, {
    foreignKey: 'reference_procedure',
    localKey: 'reference_procedure',
  })
  declare audiences: HasMany<typeof Audience>

  @column.date()
  declare date_des_faits: DateTime

  @column()
  declare faits_concis: string

  @column()
  declare faits_detailles: string

  @column()
  declare faits_detailles_searchable: string

  @column()
  declare poursuites: string

  @column()
  declare la_presse_parle_des_faits: string

  @column(dbMappers.multiSelect)
  declare collectif_d_action_ou_lutte: string[]

  @column()
  declare publiee: boolean
}
