import vine from '@vinejs/vine'

export const exportCsvValidator = vine.create(
  vine.object({
    ignore: vine.array(vine.string()).optional(),
  })
)
