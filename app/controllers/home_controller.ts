import { AudienceService } from '#services/audience_service'
import { searchQueryValidator } from '#validators/search_query'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { TimelineDataMapper } from './mappers/timeline_mapper.js'

@inject()
export default class HomeController {
  constructor(public audienceService: AudienceService) {}

  async home({ request, view }: HttpContext) {
    const searchQuery = await request.validateUsing(searchQueryValidator)

    const [audiences, villes, collectifs, chefDePreventionCategories, juridictions] =
      await Promise.all([
        this.audienceService.searchAudiences(searchQuery),
        this.audienceService.getVilles(),
        this.audienceService.getCollectifs(),
        this.audienceService.getChefDePreventionCategories(),
        this.audienceService.getJuridictions(),
      ])

    const paginations = audiences.getUrlsForRange(1, audiences.lastPage).map((anchor) => {
      const url = new URLSearchParams(request.qs())
      url.set('page', anchor.page.toString(10))
      return { url: `?${url}`, page: anchor.page }
    })

    const timelineDataMapper = new TimelineDataMapper()

    return view.render('pages/home', {
      villes,
      collectifs,
      audiences: audiences.map((audience) => {
        return {
          ...audience,
          timeline: timelineDataMapper.map(audience),
        }
      }),
      total: audiences.total,
      paginations,
      searchQuery,
      chefDePreventionCategories,
      juridictions,
    })
  }
}
