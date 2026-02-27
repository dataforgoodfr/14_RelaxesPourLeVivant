import ChefDePrevention from '#models/chef_de_prevention'
import Collectif from '#models/collectif'
import Ville from '#models/ville'
import { searchQueryValidator } from '#validators/search_query'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HomeController {
  async home({ request, view }: HttpContext) {
    const searchQuery = await request.validateUsing(searchQueryValidator)

    const query = db
      .query()
      .with('timeline', (q) => {
        q.from('audiences')
          .select(
            'reference_procedure',
            db.raw(
              "array_agg(json_object('{id,date}', ARRAY[id::text, date_de_l_audience::text])) as audiences"
            )
          )
          .groupBy('reference_procedure')
      })
      .select(
        'audiences.*',
        'procedures.titre',
        'procedures.faits_detailles',
        'procedures.faits_concis',
        'procedures.collectif_d_action_ou_lutte',
        'timeline.audiences as timeline'
      )
      .from('audiences')
      .join('procedures', 'audiences.reference_procedure', 'procedures.reference_procedure')
      .join('timeline', 'timeline.reference_procedure', 'audiences.reference_procedure')
      .where('audiences.publiee', true)
      .andWhere('procedures.publiee', true)

    if (searchQuery.search) {
      query.andWhereRaw("procedures.faits_detailles_searchable @@ to_tsquery('french', ?)", [
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
