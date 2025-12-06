/**
 * @file index.ts
 * @description Central export for all TypeScript types.
 * Re-exports database types and app-specific types.
 *
 * @exports Database types
 * @exports Entity types
 * @exports Enum types
 */

// Database types
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from './database'

// Entity types
export type {
  Firm,
  Profile,
  FirmUser,
  Document,
  Template,
  SourceFile,
  ActionLog,
} from './database'

// Enum types
export type { UserRole, DocumentStatus, ActionType } from './database'

