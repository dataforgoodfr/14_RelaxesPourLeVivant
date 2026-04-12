import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { parseCsvObjects } from 'hucre'
import { readFile } from 'node:fs/promises'

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

  async readCsv(path: string) {
    const file = await readFile(path, { encoding: 'utf-8' })
    return parseCsvObjects(file, {
      // map empty string to null value, because by default parseCsv set empty string for empty cell
      transformValue: (value) => (value === '' ? null : value),
      typeInference: true,
      header: true,
    })
  }
}
