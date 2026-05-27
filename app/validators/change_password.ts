import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string(),
    newPassword: vine.string(),
    confirmNewPassword: vine.string().sameAs('newPassword'),
  })
)

changePasswordValidator.messagesProvider = new SimpleMessagesProvider({
  'confirmNewPassword.sameAs': 'La confirmation du mot de passe ne correspond pas.',
})
