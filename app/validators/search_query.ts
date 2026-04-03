import vine from '@vinejs/vine'

const dateFormat = /\d{4}-\d{2}-\d{2}/

export const searchQueryValidator = vine.compile(
  vine.object({
    search: vine.string().optional(),
    dateDesFaits: vine.array(vine.string().regex(dateFormat)).fixedLength(2).optional(),
    dateDeLaDecision: vine.array(vine.string().regex(dateFormat)).fixedLength(2).optional(),
    dateAudience: vine.array(vine.string().regex(dateFormat)).fixedLength(2).optional(),
    decision: vine.string().optional(),
    juridiction: vine.string().optional(),
    chefDePrevention: vine.array(vine.string()).optional(),
    ville: vine.string().optional(),
    collectif: vine.array(vine.string()).optional(),
    page: vine.number().optional(),
  })
)
