import vine from '@vinejs/vine'

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string(),
    token: vine.string(),
    password: vine.string(),
    confirmPassword: vine.string().sameAs('password'),
  })
)
