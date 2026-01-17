import vine from '@vinejs/vine'

export const searchQueryValidator = vine.compile(
  vine.object({
    search: vine.string().optional(),
    startDate: vine.string().optional(),
    endDate: vine.string().optional(),
    decision: vine.string().optional(),
    juridiction: vine.string().optional(),
    chefDePrevention: vine.string().optional(),
    ville: vine.string().optional(),
    collectif: vine.string().optional(),
    page: vine.number().optional(),
  })
)
