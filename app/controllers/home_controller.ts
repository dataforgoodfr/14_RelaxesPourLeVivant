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

    const timelineDataMapper = new TimelineDataMapper()
    for (const audience of audiences) {
      Object.assign(audience, { timeline: timelineDataMapper.map(audience) })
    }

    return view.render('pages/home', {
      villes,
      collectifs,
      audiences,
      searchQuery,
      chefDePreventionCategories,
      juridictions,
      paginations: audiences
        .baseUrl('/audiences')
        .queryString(request.qs())
        .getUrlsForRange(1, audiences.lastPage),
    })
  }
}
