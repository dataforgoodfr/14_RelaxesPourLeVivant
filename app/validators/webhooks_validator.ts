import vine from '@vinejs/vine'

/**
 * Validate the user data coming from the webhook.
 */
export const userApprovedValidator = vine.compile(
  vine.object({
    data: vine.object({
      // = users
      rows: vine.array(
        vine.object({
          email: vine.string().email(),
        })
      ),
    }),
  })
)
