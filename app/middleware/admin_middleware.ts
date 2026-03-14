import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const headerAuthorization = await ctx.request.header('Authorization')

    if (!headerAuthorization) {
      return ctx.response.unauthorized()
    }

    const apiKey = headerAuthorization.split('Bearer ').at(1)

    if (env.get('NC_API_TOKEN') !== apiKey) {
      return ctx.response.unauthorized()
    }

    return next()
  }
}
