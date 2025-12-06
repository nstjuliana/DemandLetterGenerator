/**
 * @file index.ts
 * @description Central export for all Zod validation schemas.
 *
 * @exports Auth schemas and types
 */

export {
  loginSchema,
  signupSchema,
  firmCreateSchema,
  firmJoinSchema,
  profileUpdateSchema,
} from './auth'

export type {
  LoginFormData,
  SignupFormData,
  FirmCreateFormData,
  FirmJoinFormData,
  ProfileUpdateFormData,
} from './auth'

