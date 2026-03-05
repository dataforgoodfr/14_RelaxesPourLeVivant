import { AudienceService } from '#services/audience_service'
import { searchQueryValidator } from '#validators/search_query'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(public audienceService: AudienceService) {}

  async home({ request, view }: HttpContext) {
    const searchQuery = await request.validateUsing(searchQueryValidator)

    const audiences = await this.audienceService.searchAudiences(searchQuery)

    const paginations = audiences.getUrlsForRange(1, audiences.lastPage).map((anchor) => {
      const url = new URLSearchParams(request.qs())
      url.set('page', anchor.page.toString(10))
      return { url: `?${url}`, page: anchor.page }
    })

    return view.render('pages/home', {
      audiences,
      paginations,
      searchQuery,
    })
  }
}
