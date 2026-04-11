import { importCsvValidator } from '#validators/import_csv'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { readFile } from 'node:fs/promises'
import { parseCsvObjects } from 'hucre'
import { ImportService } from '#services/import_service'

@inject()
export default class ImportsController {
  constructor(private readonly importService: ImportService) {}

  async import({ response, request, logger }: HttpContext) {
    const { csv, ignore } = await request.validateUsing(importCsvValidator)
    const tableName = request.param('table')

    const file = await readFile(csv.tmpPath!, { encoding: 'utf-8' })
    const { data, headers } = await parseCsvObjects(file, {
      // map empty string to null value, because by default parseCsv set empty string for empty cell
      transformValue: (value) => (value === '' ? null : value),
      typeInference: true,
      header: true,
    })

    const columns = await this.importService.introspect(tableName, ignore)
    if (!columns) {
      return response.status(400).json({
        code: 'E_IMPORT_UNKNOWN_TABLE',
        message: `unknown table ${tableName}`,
      })
    }
    const validation = this.validateHeaders(headers, columns)
    if (!validation.ok) {
      return response
        .status(400)
        .json({ code: 'E_IMPORT_INVALID_HEADERS', errors: validation.errors })
    }

    const groups = await this.importService.splitNewAndExistingRecords(tableName, data)

    await db.transaction(async (trx) => {
      if (groups.new) {
        logger.info(`creating ${groups.new.length} new ${tableName}`)
        await trx.table(tableName).multiInsert(groups.new)
        logger.info(`${groups.new.length} new ${tableName} created`)
      }

      if (groups.existing) {
        logger.info(`updating ${groups.existing.length} ${tableName}`)

        for (const record of groups.existing) {
          await trx
            .from(tableName)
            .where('id', record.id as string)
            .update(record)
        }

        logger.info(`${groups.existing.length} ${tableName} updated`)
      }

      await this.importService.refreshAutoIncrement(tableName, trx)
    })

    return response.created()
  }

  private validateHeaders(actual: string[], expected: string[]): { ok: boolean; errors: string[] } {
    const errors: string[] = []
    for (const header of expected) {
      if (!actual.includes(header)) {
        errors.push(`missing header: "${header}"`)
      }
    }
    return { ok: errors.length === 0, errors }
  }
}
