import env from '#start/env'
import string from '@adonisjs/core/helpers/string'
import { icons as phIcons } from '@iconify-json/ph'
import { addCollection, edgeIconify } from 'edge-iconify'
import edge from 'edge.js'
import { DateTime } from 'luxon'
import content from '../app/data/content.json' with { type: 'json' }

edge.global('DateTime', DateTime)
edge.global('stringHelper', string)

addCollection(phIcons)
edge.use(edgeIconify)
edge.global('env', env)
edge.global('content', content)

/**
 * Map a juridiction label.
 * If both juridiction and ville_de_l_audience are present, it returns "juridiction de Ville_de_l_audience"
 * If only one of them is present, it returns the one that is present
 * If none of them are present, it returns an empty string
 * @param audience
 * @returns
 */
const juridictionLabel = (
  juridiction: string,
  ville_de_l_audience: string,
  degre_de_juridiction?: string
) => {
  const firstPart = [juridiction, string.capitalCase(ville_de_l_audience ?? '')]
    .filter(Boolean)
    .join(' de ')
  return degre_de_juridiction ? `${firstPart} - ${degre_de_juridiction}` : firstPart
}

const dateDecisionLabel = (date_de_decision?: DateTime) => {
  return date_de_decision?.toFormat('dd.MM.yyyy') ?? 'À venir'
}

edge.global('audienceHelper', { juridictionLabel, dateDecisionLabel })
