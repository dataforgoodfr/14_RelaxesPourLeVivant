import vine from '@vinejs/vine'

export const importCsvValidator = vine.compile(
  vine.object({
    csv: vine.file({
      size: '10mb',
      extnames: ['csv'],
    }),
    ignore: vine.array(vine.string()).optional(),
  })
)
