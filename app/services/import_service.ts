import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { readFileSync } from 'node:fs'
import { dsvFormat, autoType } from 'd3-dsv'
import stripBom from 'strip-bom'

export class ImportService {
  async introspect(tableName: string, ignore: string[] = []): Promise<string[] | null> {
    const rows: Array<{ column_name: string }> = await db
      .from('information_schema.columns')
      .select('column_name')
      .where('table_name', tableName)
      .andWhere('is_generated', 'NEVER')

    if (!rows.length) {
      return null
    }

    return rows.map((row) => row.column_name).filter((column) => !ignore.includes(column))
  }

  async splitNewAndExistingRecords<T extends Record<string, any>>(
    tableName: string,
    rows: Array<T>
  ) {
    const result: Array<{ id: number }> = await db
      .from(tableName)
      .select('id')
      .whereIn(
        'id',
        rows.map((item) => item.id)
      )

    const existingIds = result.map((r) => r.id)

    return Object.groupBy(rows, (row) =>
      existingIds.includes(Number(row.id)) ? 'existing' : 'new'
    )
  }

  async refreshAutoIncrement(table: string, trx: TransactionClientContract) {
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

  readCsv(path: string) {
    const file = readFileSync(path, { encoding: 'utf-8' })
    const result = dsvFormat(';').parse(stripBom(file), autoType)
    return { data: result as Record<string, any>[], headers: result.columns as string[] }
  }
}
