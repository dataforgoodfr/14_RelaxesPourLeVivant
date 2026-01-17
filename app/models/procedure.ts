import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Audience from './audience.js'
import Collectif from './collectif.js'

export default class Procedure extends BaseModel {
  @column({ isPrimary: true })
  declare nom: string

  @hasMany(() => Audience, {
    foreignKey: 'nom_de_la_procedure',
    localKey: 'nom',
  })
  declare audiences: HasMany<typeof Audience>

  @column.date()
  declare date_des_faits: DateTime

  @column()
  declare courte_description: string

  @column()
  declare description: string

  @column()
  declare description_searchable: string

  @column()
  declare poursuites: string

  @column()
  declare nom_des_parties_civiles: string

  @column()
  declare la_presse_parle_des_faits: string

  @belongsTo(() => Collectif, {
    foreignKey: 'collectif_d_action_ou_lutte',
    localKey: 'nom',
  })
  declare collectif: BelongsTo<typeof Collectif>

  @column()
  declare collectif_d_action_ou_lutte: string
}
