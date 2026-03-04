import User from '#models/user'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique({ table: User.table, column: 'email' }),
    password: vine.string(),
    confirmPassword: vine.string().sameAs('password'),
    motivation: vine.string().maxLength(1000),
  })
)

createUserValidator.messagesProvider = new SimpleMessagesProvider({
  'email.database.unique': 'Un compte semble déjà associé à cette email',
  'confirmPassword.sameAs': 'Vos mots de passe ne sont pas identiques',
})
