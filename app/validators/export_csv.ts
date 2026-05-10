import vine from '@vinejs/vine'

export const exportCsvValidator = vine.compile(
  vine.object({
    ignore: vine.array(vine.string()).optional(),
  })
)
