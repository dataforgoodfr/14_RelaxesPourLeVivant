import Dashboard from '#models/dashboard'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class NavbarDataMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // This will attempt to load the user from session/cookie.
    const loggedIn = await ctx.auth.check()

    ctx.view.share({
      navbar: null as null | { analyses: Dashboard[] },
    })

    if (loggedIn) {
      const analyses = await Dashboard.query().where('publiee', true)

      ctx.view.share({
        navbar: { analyses },
      })
    }

    return next()
  }
}
