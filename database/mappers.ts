import { AppFile } from '#models/common'
import { AttachmentRecord } from '#models/vendors/nocodb'
import { ColumnOptions } from '@adonisjs/lucid/types/model'

// ---- Multiselect ----

/**
 * Map a nocodb multiselect type to a string array.
 * @param multiSelect
 * @returns
 */
export function multiSelectToStringList(multiSelect: string | null | undefined): string[] {
  if (multiSelect) {
    return multiSelect.split(',')
  }
  return []
}

/**
 * Map a string array to a nocodb multiselect type.
 * @param stringList
 * @returns
 */
export function stringListToMultiSelect(stringList: string[]): string {
  return stringList.join(',')
}

// ---- Attachment ----

/**
 * Map a nocodb attachment type to an array of AppFile.
 * @param attachment
 * @returns
 */
export function attachmentToFiles(attachment: string | null | undefined): AppFile[] {
  return attachment
    ? JSON.parse(attachment).map((recit: AttachmentRecord) => ({
        ...recit,
        extension: recit.title.split('.')[1] ?? null,
      }))
    : []
}

/**
 * Map an array of AppFile to a nocodb attachment type.
 * @param files
 * @returns
 */
export function filesToAttachment(files: AppFile[]): string {
  return JSON.stringify(files)
}

// ---- Exported mappers ----
export const dbMappers: Record<string, Pick<ColumnOptions, 'prepare' | 'consume'>> = {
  multiSelect: {
    prepare: stringListToMultiSelect,
    consume: multiSelectToStringList,
  },
  attachment: {
    prepare: filesToAttachment,
    consume: attachmentToFiles,
  },
}
