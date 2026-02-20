import vine from '@vinejs/vine'

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string(),
    confirmPassword: vine.string().sameAs('password'),
  })
)
