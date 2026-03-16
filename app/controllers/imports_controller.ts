import { importCsvValidator } from '#validators/import_csv'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { readFile, rm } from 'node:fs/promises'

export default class ImportsController {
  async import({ request, response, logger }: HttpContext) {
    const { csv } = await request.validateUsing(importCsvValidator)

    const data = await readFile(csv.tmpPath!, { encoding: 'base64' })

    await db.knexRawQuery(
      `COPY ?? FROM PROGRAM 'echo ${data} | base64 -d' WITH (FORMAT csv, HEADER, DELIMITER ';', FORCE_NULL *)`,
      [request.param('table')]
    )

    try {
      await rm(csv.tmpPath!)
    } catch (err) {
      logger.warn(err, 'fail to remove the csv file after the import')
    }

    return response.ok('upload success')
  }
}
