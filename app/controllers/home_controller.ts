import ChefDePrevention from '#models/chef_de_prevention'
import Collectif from '#models/collectif'
import Ville from '#models/ville'
import { searchQueryValidator } from '#validators/search_query'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HomeController {
  async home({ request, view }: HttpContext) {
    const searchQuery = await await request.validateUsing(searchQueryValidator)

    const query = db
      .from('audiences')
      .select(
        'audiences.*',
        'procedures.description',
        'procedures.courte_description',
        'procedures.collectif_d_action_ou_lutte',
        'timeline.audiences as timeline'
      )
      .join('procedures', 'audiences.nom_de_la_procedure', 'procedures.nom')
      .joinRaw(
        `
JOIN (
    select
      nom_de_la_procedure name, 
      array_agg(json_object('{id,date}', ARRAY[id::text, date_de_l_audience::text])) audiences 
    from audiences
    group by nom_de_la_procedure
  ) as timeline
ON timeline.name = audiences.nom_de_la_procedure
        `
      )
      .where('audiences.publiee', true)
      .andWhere('procedures.publiee', true)

    if (searchQuery.search) {
      query.andWhereRaw("procedures.description_searchable @@ to_tsquery('french', ?)", [
        searchQuery.search,
      ])
    }

    if (searchQuery.startDate && searchQuery.endDate) {
      query.andWhereBetween('audiences.date_de_l_audience', [
        searchQuery.startDate,
        searchQuery.endDate,
      ])
    }

    if (searchQuery.decision) {
      query.andWhere('audiences.decision_pour_les_faits', searchQuery.decision)
    }

    if (searchQuery.juridiction) {
      query.andWhere('audiences.juridiction', searchQuery.juridiction)
    }

    if (searchQuery.ville) {
      query.andWhere('audiences.ville_de_l_audience', searchQuery.ville)
    }

    if (searchQuery.collectif) {
      query.andWhere('procedures.collectif_d_action_ou_lutte', searchQuery.collectif)
    }

    const audiences = await query.paginate(searchQuery.page ?? 1, 50)

    const villes = await Ville.all()
    const collectifs = await Collectif.all()
    const chefDePreventions = await ChefDePrevention.all()
    const paginations = audiences.getUrlsForRange(1, audiences.lastPage).map((anchor) => {
      const url = new URLSearchParams(request.qs())
      url.set('page', anchor.page.toString(10))
      return { url: `?${url}`, page: anchor.page }
    })

    return view.render('pages/home', {
      audiences,
      villes,
      collectifs,
      chefDePreventions,
      paginations,
      searchQuery,
    })
  }
}
