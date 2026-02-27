import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Audience from './audience.js'
import Collectif from './collectif.js'

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

  @belongsTo(() => Collectif, {
    foreignKey: 'collectif_d_action_ou_lutte',
    localKey: 'nom',
  })
  declare collectif: BelongsTo<typeof Collectif>

  @column()
  declare collectif_d_action_ou_lutte: string

  @column()
  declare publiee: boolean
}
