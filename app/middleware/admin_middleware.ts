import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class WebhookMiddleware {
  private readonly apiToken = env.get('NC_API_TOKEN')

  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.request.header('Authorization') !== `Bearer ${this.apiToken}`) {
      return ctx.response.unauthorized({ error: 'Invalid API token' })
    }

    await next()
  }
}
