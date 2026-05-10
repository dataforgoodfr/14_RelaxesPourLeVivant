import { importCsvValidator } from '#validators/import_csv'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { ImportService } from '#services/import_service'
import logger from '@adonisjs/core/services/logger'
import PresseArticle from '#models/presse_article'
import Procedure from '#models/procedure'
import Audience from '#models/audience'
import type { Readable } from 'node:stream'
import { exportCsvValidator } from '#validators/export_csv'

interface ImportStrategie {
  (
    table: { name: string; columns: string[] },
    csv: { data: Record<string, any>[]; headers: string[] }
  ): Promise<{ validationErrors: string[] } | undefined>
}

interface ExportStrategie {
  (table: { name: string; columns: string[] }): Promise<Readable>
}

@inject()
export default class ImportsController {
  constructor(private readonly importService: ImportService) {}

  async import({ response, request }: HttpContext) {
    const { csv: file, ignore = [] } = await request.validateUsing(importCsvValidator)
    const tableName: string = request.param('table')

    const csv = await this.importService.readCsv(file.tmpPath!)

    const columns = await this.importService.introspect(tableName, ignore)
    if (!columns) {
      return response.badRequest({
        code: 'E_IMPORT_UNKNOWN_TABLE',
        message: `unknown table ${tableName}`,
      })
    }

    const table = { name: tableName, columns }
    let result: Awaited<ReturnType<ImportStrategie>>
    switch (table.name) {
      case PresseArticle.table:
        result = await this.importStrategies.presseArticles(table, csv)
        break
      case Procedure.table:
        result = await this.importStrategies.default(table, csv, {
          refColumn: 'reference_procedure',
        })
        break
      default:
        result = await this.importStrategies.default(table, csv)
        break
    }

    if (result?.validationErrors) {
      return response
        .status(400)
        .json({ code: 'E_IMPORT_INVALID_HEADERS', errors: result.validationErrors })
    }

    return response.created()
  }

  private importStrategies = {
    presseArticles: async (
      table: { name: string; columns: string[] },
      csv: { data: Record<string, any>[]; headers: string[] }
    ) => {
      // specials headers in CSV to define links between presse_artilces and procedures or audiences
      table.columns.push('reference_procedure')
      table.columns.push('audience_id')
      const validation = this.validateHeaders({ actual: csv.headers, expected: table.columns })
      if (!validation.ok) {
        return { validationErrors: validation.errors }
      }

      const { presseArticles, audiencesPresseArticles, proceduresPresseArticles } =
        csv.data.reduce<{
          presseArticles: Record<string, any>[]
          proceduresPresseArticles: Array<{ presse_article_id: any; reference_procedure: any }>
          audiencesPresseArticles: Array<{ presse_article_id: any; audience_id: any }>
        }>(
          (acc, row) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { reference_procedure, audience_id, ...rest } = row
            if (reference_procedure) {
              acc.proceduresPresseArticles.push({
                presse_article_id: rest.id,
                reference_procedure,
              })
            }
            if (audience_id) {
              acc.audiencesPresseArticles.push({
                presse_article_id: rest.id,
                audience_id,
              })
            }
            acc.presseArticles.push(rest)
            return acc
          },
          {
            presseArticles: [],
            proceduresPresseArticles: [],
            audiencesPresseArticles: [],
          }
        )

      const groups = await this.importService.splitNewAndExistingRecords(table.name, presseArticles)

      await db.transaction(async (trx) => {
        if (groups.new) {
          logger.info(`creating ${groups.new.length} new ${table.name}`)

          await trx.table(table.name).multiInsert(groups.new)

          const procedurePivotValues = proceduresPresseArticles.filter((pivot) =>
            groups.new!.some((record) => record.id === pivot.presse_article_id)
          )
          if (procedurePivotValues.length) {
            await trx.table('procedures_presse_articles').multiInsert(procedurePivotValues)
          }

          const audiencePivotValues = audiencesPresseArticles.filter((pivot) =>
            groups.new!.some((record) => record.id === pivot.presse_article_id)
          )
          if (audiencePivotValues.length) {
            await trx.table('audiences_presse_articles').multiInsert(audiencePivotValues)
          }

          logger.info(`${groups.new.length} new ${table.name} created`)
        }

        if (groups.existing) {
          logger.info(`updating ${groups.existing.length} ${table.name}`)

          for (const record of groups.existing) {
            await trx
              .from(table.name)
              .where('id', record.id as string)
              .update(record)

            const procedurePivot = proceduresPresseArticles.find(
              (pivot) => pivot.presse_article_id === record.id
            )
            if (procedurePivot) {
              await trx
                .from('procedures_presse_articles')
                .where('presse_article_id', record.id as string)
                .update(procedurePivot)
            }

            const audiencePivot = audiencesPresseArticles.find(
              (pivot) => pivot.presse_article_id === record.id
            )
            if (audiencePivot) {
              await trx
                .from('audiences_presse_articles')
                .where('presse_article_id', record.id as string)
                .update(audiencePivot)
            }
          }

          logger.info(`${groups.existing.length} ${table.name} updated`)
        }

        await this.importService.refreshAutoIncrement('presse_articles', trx)
      })
    },
    default: async (
      table: { name: string; columns: string[] },
      csv: { data: Record<string, any>[]; headers: string[] },
      options: { refColumn: string } = { refColumn: 'id' }
    ) => {
      const validation = this.validateHeaders({ actual: csv.headers, expected: table.columns })
      if (!validation.ok) {
        return { validationErrors: validation.errors }
      }

      const groups = await this.importService.splitNewAndExistingRecords(
        table.name,
        csv.data,
        options
      )

      await db.transaction(async (trx) => {
        if (groups.new) {
          logger.info(`creating ${groups.new.length} new ${table.name}`)
          await trx.table(table.name).multiInsert(groups.new)
          logger.info(`${groups.new.length} new ${table.name} created`)
        }

        if (groups.existing) {
          logger.info(`updating ${groups.existing.length} ${table.name}`)

          for (const record of groups.existing) {
            await trx
              .from(table.name)
              .where(options.refColumn, record[options.refColumn] as string)
              .update(record)
          }

          logger.info(`${groups.existing.length} ${table.name} updated`)
        }

        await this.importService.refreshAutoIncrement(table.name, trx)
      })
    },
  } satisfies Record<string, ImportStrategie>

  private validateHeaders(input: { actual: string[]; expected: string[] }): {
    ok: boolean
    errors: string[]
  } {
    const errors: string[] = []
    for (const header of input.expected) {
      if (!input.actual.includes(header)) {
        errors.push(`missing header: "${header}"`)
      }
    }
    return { ok: errors.length === 0, errors }
  }

  async export({ response, request }: HttpContext) {
    const { ignore = [] } = await request.validateUsing(exportCsvValidator)
    const tableName: string = request.param('table')

    const columns = await this.importService.introspect(tableName, ignore)
    if (!columns) {
      return response.badRequest({
        code: 'E_EXPORT_UNKNOWN_TABLE',
        message: `unknown table ${tableName}`,
      })
    }

    const table = { name: tableName, columns }
    let csv: Readable | undefined
    switch (tableName) {
      case Audience.table:
        csv = await this.exportStrategies.audience(table)
        break
      case Procedure.table: {
        csv = await this.exportStrategies.procedure(table)
        break
      }
      case PresseArticle.table: {
        csv = await this.exportStrategies.presseArticle(table)
        break
      }
    }

    if (!csv) {
      return response.badRequest({
        code: 'E_EXPORT_UNKNOWN_TABLE',
        message: `unknown table ${tableName}`,
      })
    }

    return response.type('.csv').stream(csv)
  }

  private exportStrategies = {
    audience: async (table: { name: string; columns: string[] }) => {
      const audiences = await db.query().select().from(table.name)
      return this.importService.writeCsv(
        audiences.map((a) => ({
          ...a,
          date_de_l_audience: this.importService.formatDateToCsvDate(a.date_de_l_audience),
          date_de_decision: this.importService.formatDateToCsvDate(a.date_de_decision),
        })),
        Array.from(table.columns)
      )
    },
    procedure: async (table: { name: string; columns: string[] }) => {
      const procedures = await db.query().select().from(table.name)
      return this.importService.writeCsv(
        procedures.map((p) => {
          return {
            ...p,
            date_des_faits: this.importService.formatDateToCsvDate(p.date_des_faits),
          }
        }),
        Array.from(table.columns)
      )
    },
    presseArticle: async (table: { name: string; columns: string[] }) => {
      const presseArticles = await db
        .query()
        .select(
          'presse_articles.*',
          'audiences_presse_articles.audience_id as audience_id',
          'procedures_presse_articles.reference_procedure as reference_procedure'
        )
        .from(table.name)
        .leftJoin(
          'audiences_presse_articles',
          'audiences_presse_articles.presse_article_id',
          'presse_articles.id'
        )
        .leftJoin(
          'procedures_presse_articles',
          'procedures_presse_articles.presse_article_id',
          'presse_articles.id'
        )
      return this.importService.writeCsv(
        presseArticles,
        table.columns.concat(['audience_id', 'reference_procedure'])
      )
    },
  } satisfies Record<string, ExportStrategie>
}
