import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Procedure from './procedure.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Ville from './ville.js'

export default class Audience extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @belongsTo(() => Procedure, {
    foreignKey: 'nom_de_la_procedure',
    localKey: 'nom',
  })
  declare procedure: BelongsTo<typeof Procedure>

  @column()
  declare nom_de_la_procedure?: string

  @column.date()
  declare date_de_l_audience?: DateTime

  @belongsTo(() => Ville, {
    foreignKey: 'nom',
    localKey: 'ville_de_l_audience',
  })
  declare ville: BelongsTo<typeof Ville>

  @column()
  declare ville_de_l_audience?: string

  @column()
  declare juridiction?:
    | 'Tribunal de police'
    | 'Tribunal correctionnel'
    | 'Cour d’appel'
    | 'Cour de cassation'

  @column.date()
  declare date_de_decision?: DateTime

  @column()
  declare decision_pour_les_faits?: 'Condamnable' | 'Relaxe'

  @column()
  declare decision_pour_les_infractions?: 'Condamnable' | 'Relaxe'

  @column()
  declare numero_de_chambre?: number

  @column()
  declare nombre_de_prevenu_es?: number

  @column()
  declare nombre_de_temoins?: number

  @column()
  declare expertise_des_temoins?: string

  @column()
  declare nombre_d_avocat_es?: number

  @column()
  declare nom_des_parties_civiles?: string

  @column()
  declare demande_des_parties_civiles?: string

  @column()
  declare composition_du_tribunal?: 'Juge unique' | 'Formation collégiale'

  @column()
  declare fondement_de_la_relaxe?:
    | 'Infraction non caractérisée'
    | 'Etat de nécessité'
    | 'Liberté d’expression'

  @column()
  declare peine_pour_les_faits?: string

  @column()
  declare detail_de_la_peine?: string

  @column()
  declare score_de_la_gravite?: number

  @column()
  declare peine_complementaire?: string

  @column()
  declare peine_pour_les_infractions?: string

  @column()
  declare appel_d_une_des_parties?: boolean

  @column()
  declare partie_de_l_appel_principal?: 'Prévenu·e' | 'Parquet' | 'Partie Civile'

  @column()
  declare partie_de_l_appel_incident?: string

  @column()
  declare recit_d_audience?: string

  @column()
  declare decision?: string

  @column()
  declare resume_du_jugement_ou_arret?: string
}
