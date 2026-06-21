import string from '@adonisjs/core/helpers/string'
import type { DateTime } from 'luxon'

/**
 * Map a juridiction label.
 * If both juridiction and ville_de_l_audience are present, it returns "juridiction de Ville_de_l_audience"
 * If only one of them is present, it returns the one that is present
 * If none of them are present, it returns an empty string
 * @param audience
 * @returns
 */
export const juridictionLabel = (
  juridiction: string,
  ville_de_l_audience: string,
  degre_de_juridiction?: string
) => {
  const firstPart = [juridiction, string.capitalCase(ville_de_l_audience ?? '')]
    .filter(Boolean)
    .join(' de ')
  return degre_de_juridiction ? `${firstPart} - ${degre_de_juridiction}` : firstPart
}

/**
 * Map a date to a label.
 * If the date is present, it returns the date in the format "dd.MM.yyyy"
 * If the date is not present, it returns "À venir"
 * @param date
 * @returns
 */
export const dateLabel = (date?: DateTime) => {
  return date?.toFormat('dd.MM.yyyy') ?? 'À venir'
}

const audienceHelper = {
  juridictionLabel,
  dateLabel,
}

export default audienceHelper
