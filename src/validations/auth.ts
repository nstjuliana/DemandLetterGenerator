/**
 * @file auth.ts
 * @description Zod validation schemas for authentication forms.
 * Used with react-hook-form for form validation.
 *
 * @exports loginSchema - Schema for login form
 * @exports signupSchema - Schema for signup form
 * @exports firmCreateSchema - Schema for creating a new firm
 * @exports firmJoinSchema - Schema for joining a firm by invite code
 */

import { z } from 'zod'

/**
 * Schema for login form validation.
 * Requires valid email and password with minimum length.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

/** Type for login form data */
export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema for signup form validation.
 * Requires email, password with confirmation, and optional full name.
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/** Type for signup form data */
export type SignupFormData = z.infer<typeof signupSchema>

/**
 * Schema for creating a new firm.
 * Requires firm name.
 */
export const firmCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Firm name is required')
    .min(2, 'Firm name must be at least 2 characters')
    .max(100, 'Firm name must be less than 100 characters'),
})

/** Type for firm creation form data */
export type FirmCreateFormData = z.infer<typeof firmCreateSchema>

/**
 * Schema for joining a firm by invite code.
 * Requires valid invite code format.
 */
export const firmJoinSchema = z.object({
  inviteCode: z
    .string()
    .min(1, 'Invite code is required')
    .length(12, 'Invite code must be 12 characters'),
})

/** Type for firm join form data */
export type FirmJoinFormData = z.infer<typeof firmJoinSchema>

/**
 * Schema for profile update form.
 * Allows updating display name.
 */
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
})

/** Type for profile update form data */
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

