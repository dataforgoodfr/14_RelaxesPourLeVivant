import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Procedure from './procedure.js'
import { AttachmentRecord } from './vendors/nocodb.js'

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

  @column()
  declare reference_de_la_decision?: string

  @column()
  declare ville_de_l_audience?: string

  @column()
  declare juridiction?: string

  @column()
  declare degre_de_juridiction?: string

  @column.date()
  declare date_de_decision?: DateTime

  @column()
  declare details_de_la_decision_pour_les_infractions_principales?: string

  @column()
  declare decision_pour_les_infractions_principales?: string

  @column()
  declare numero_de_chambre?: string

  @column()
  declare chefs_de_prevention_categorie?: string

  @column()
  declare chefs_de_prevention_sous_categorie?: string

  @column()
  declare nombre_de_prevenus?: number

  @column()
  declare plaidoirie_de_la_defense?: string

  @column()
  declare noms_des_parties_civiles?: string

  @column()
  declare demande_des_parties_civiles?: string

  @column()
  declare requisitions?: string

  @column()
  declare fondement_de_la_relaxe?: string

  @column()
  declare type_de_peine_pour_les_infractions_principales?: string

  @column()
  declare details_des_peines_pour_les_infractions_principales?: string

  @column()
  declare decision_et_peines_pour_les_infractions_subies_ou_incidentes?: string

  @column()
  declare score_de_la_gravite?: number

  @column()
  declare dommages_et_interets?: boolean

  @column()
  declare detail_des_dommages_et_interets?: string

  @column()
  declare appel_d_une_des_parties?: boolean

  @column()
  declare partie_de_l_appel_principal?: 'Prévenu·e' | 'Parquet' | 'Partie Civile'

  @column()
  declare partie_de_l_appel_incident?: 'Prévenu·e' | 'Parquet' | 'Partie Civile'

  @column()
  declare la_presse_parle_du_proces?: string // TODO : link to the table articles_de_presse

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
  declare jugement_ou_arret?: RecitFile[]

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
