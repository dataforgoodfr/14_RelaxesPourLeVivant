import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Procedure from './procedure.js'
import { AttachmentRecord } from './vendors/nocodb.js'
import Ville from './ville.js'

export type RecitFile = AttachmentRecord & { extension: string }

export default class Audience extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @belongsTo(() => Procedure, {
    foreignKey: 'reference_procedure',
    localKey: 'reference_procedure',
  })
  declare procedure: BelongsTo<typeof Procedure>

  @column()
  declare reference_procedure?: string

  @column.date()
  declare date_de_l_audience?: DateTime

  @belongsTo(() => Ville, {
    foreignKey: 'ville_de_l_audience',
    localKey: 'nom',
  })
  declare ville: BelongsTo<typeof Ville>

  @column()
  declare ville_de_l_audience?: string

  @column()
  declare juridiction?:  // TODO : change to dynamic choices
    | 'Tribunal de police'
    | 'Tribunal correctionnel'
    | 'Cour d’appel'
    | 'Cour de cassation'

  @column.date()
  declare date_de_decision?: DateTime

  // TODO : change to dynamic list
  @column()
  declare decision_pour_les_infractions_principales?: 'Condamnable' | 'Relaxe'

  @column()
  declare numero_de_chambre?: string

  @column()
  declare nombre_de_prevenu_es?: number

  @column()
  declare noms_des_parties_civiles?: string

  @column()
  declare demande_des_parties_civiles?: string

  // TODO : change to dynamic list
  @column()
  declare fondement_de_la_relaxe?:
    | 'Infraction non caractérisée'
    | 'Etat de nécessité'
    | 'Liberté d’expression'

  @column()
  declare type_de_peine_pour_les_infractions_principales?: string

  @column()
  declare details_des_peines_pour_les_infractions_principales?: string

  @column()
  declare decision_et_peines_pour_les_infractions_subies_ou_incidentes?: string

  @column()
  declare score_de_la_gravite?: float

  @column()
  declare appel_d_une_des_parties?: boolean

  @column()
  declare partie_de_l_appel_principal?: 'Prévenu·e' | 'Parquet' | 'Partie Civile'

  @column()
  declare partie_de_l_appel_incident?: 'Prévenu·e' | 'Parquet' | 'Partie Civile'

  @column({
    consume: (value: string | null) => {
      return value
        ? JSON.parse(value).map((recit: AttachmentRecord) => ({
            ...recit,
            extension: recit.title.split('.')[1] ?? null,
          }))
        : []
    },
  })
  declare recit_d_audience?: RecitFile[]

  // TODO : add column File for "jugement_ou_arret"

  @column()
  declare reference_de_la_decision?: string

  @column()
  declare resume_du_jugement_ou_arret?: string

  @column()
  declare resume_de_l_audience?: string

  @column()
  declare commentaire_msde?: string

  @column()
  declare extrait_de_la_decision?: string

  @column()
  declare mots_cles?: string

  @column()
  declare publiee: boolean
}
