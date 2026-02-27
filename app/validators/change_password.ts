import vine from '@vinejs/vine'

export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string(),
    newPassword: vine.string(),
    confirmNewPassword: vine.string().sameAs('newPassword'),
  })
)
