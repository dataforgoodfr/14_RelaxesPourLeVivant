/**
 * NocoDB Attachment Record Type.
 * We list common properties here. The type definition depends on the mime type.
 * For example an image would also have width, height.
 */
export interface AttachmentRecord {
  /**
   * Auto generated unique identifier for the file.
   */
  id: string
  /**
   * Download path.
   */
  path: string
  /**
   * Original file name.
   */
  title: string
  mimetype: string
  size: number
}
