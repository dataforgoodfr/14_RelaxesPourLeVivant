import User from '#models/user'
import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique({ table: User.table, column: 'email' }),
    password: vine.string(),
    confirmPassword: vine.string().sameAs('password'),
    motivation: vine.string().maxLength(1000),
  })
)
