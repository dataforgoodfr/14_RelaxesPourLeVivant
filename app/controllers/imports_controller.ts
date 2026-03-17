import { importCsvValidator } from '#validators/import_csv'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { readFile, rm } from 'node:fs/promises'

export default class ImportsController {
  async import({ request, response, logger }: HttpContext) {
    const { csv } = await request.validateUsing(importCsvValidator)

    const data = await readFile(csv.tmpPath!, { encoding: 'base64' })

    const trx = await db.transaction()

    await trx.knexRawQuery(
      `COPY ?? FROM PROGRAM 'echo ${data} | base64 -d' WITH (FORMAT csv, HEADER, DELIMITER ';', FORCE_NULL *)`,
      [request.param('table')]
    )

    await this.refreshAutoIncrement(request.param('table'), trx)

    await trx.commit()

    try {
      await rm(csv.tmpPath!)
    } catch (err) {
      logger.warn(err, 'fail to remove the csv file after the import')
    }

    return response.ok('upload success')
  }

  private async refreshAutoIncrement(table: string, trx: TransactionClientContract) {
    const resultSeqNameQuery = await trx.knexRawQuery(
      `SELECT pg_get_serial_sequence as seqname FROM pg_get_serial_sequence(?, 'id')`,
      [table]
    )

    if (!resultSeqNameQuery.rowCount) {
      return
    }

    const resultMaxIdQuery = await trx.knexRawQuery(
      'SELECT COALESCE(MAX(id), 0) as maxid FROM ??',
      [table]
    )

    if (!resultMaxIdQuery.rowCount) {
      return
    }

    const seqName = resultSeqNameQuery.rows.at(0).seqname
    const maxId = resultMaxIdQuery.rows.at(0).maxid

    await trx.knexRawQuery(`ALTER SEQUENCE ${seqName} RESTART WITH ${maxId + 1}`)
  }
}
