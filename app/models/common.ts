import { AttachmentRecord } from './vendors/nocodb.js'

/**
 * Represents a file in the application with precomputed properties.
 * Derived from NocoDB's AttachmentRecord.
 */
export type AppFile = AttachmentRecord & { extension: string }
