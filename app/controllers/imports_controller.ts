import { importCsvValidator } from '#validators/import_csv'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { ImportService } from '#services/import_service'
import logger from '@adonisjs/core/services/logger'
import PresseArticle from '#models/presse_article'

interface ImportStategie {
  (
    table: { name: string; columns: string[] },
    csv: { data: Record<string, any>[]; headers: string[] }
  ): Promise<{ validationErrors: string[] } | undefined>
}

@inject()
export default class ImportsController {
  constructor(private readonly importService: ImportService) {}

  async execute({ response, request }: HttpContext) {
    const { csv: file, ignore = [] } = await request.validateUsing(importCsvValidator)
    const tableName: string = request.param('table')

    const csv = await this.importService.readCsv(file.tmpPath!)

    const columns = await this.importService.introspect(tableName, ignore)
    if (!columns) {
      return response.status(400).json({
        code: 'E_IMPORT_UNKNOWN_TABLE',
        message: `unknown table ${tableName}`,
      })
    }

    const table = { name: tableName, columns }
    let result: Awaited<ReturnType<ImportStategie>>
    switch (table.name) {
      case PresseArticle.table:
        result = await this.importStategies.presseArticles(table, csv)
        break
      default:
        result = await this.importStategies.default(table, csv)
        break
    }

    if (result?.validationErrors) {
      return response
        .status(400)
        .json({ code: 'E_IMPORT_INVALID_HEADERS', errors: result.validationErrors })
    }

    return response.created()
  }

  private importStategies: Record<string, ImportStategie> = {
    presseArticles: async (
      table: { name: string; columns: string[] },
      csv: { data: Record<string, any>[]; headers: string[] }
    ) => {
      // specials headers in CSV to define links between presse_artilces and procedures or audiences
      table.columns.push('procedure_id')
      table.columns.push('audience_id')
      const validation = this.validateHeaders({ actual: csv.headers, expected: table.columns })
      if (!validation.ok) {
        return { validationErrors: validation.errors }
      }

      const { presseArticles, audiencesPresseArticles, proceduresPresseArticles } =
        csv.data.reduce<{
          presseArticles: Record<string, any>[]
          proceduresPresseArticles: Array<{ presse_article_id: any; procedure_id: any }>
          audiencesPresseArticles: Array<{ presse_article_id: any; audience_id: any }>
        }>(
          (acc, row) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { procedure_id, audience_id, ...rest } = row
            if (procedure_id) {
              acc.proceduresPresseArticles.push({
                presse_article_id: rest.id,
                procedure_id,
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

          await trx
            .table('procedures_presse_articles')
            .multiInsert(
              proceduresPresseArticles.filter((pivot) =>
                groups.new!.some((record) => record.id === pivot.presse_article_id)
              )
            )

          await trx
            .table('audiences_presse_articles')
            .multiInsert(
              audiencesPresseArticles.filter((pivot) =>
                groups.new!.some((record) => record.id === pivot.presse_article_id)
              )
            )

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
      csv: { data: Record<string, any>[]; headers: string[] }
    ) => {
      const validation = this.validateHeaders({ actual: csv.headers, expected: table.columns })
      if (!validation.ok) {
        return { validationErrors: validation.errors }
      }

      const groups = await this.importService.splitNewAndExistingRecords(table.name, csv.data)

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
              .where('id', record.id as string)
              .update(record)
          }

          logger.info(`${groups.existing.length} ${table.name} updated`)
        }

        await this.importService.refreshAutoIncrement(table.name, trx)
      })
    },
  }

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
}
