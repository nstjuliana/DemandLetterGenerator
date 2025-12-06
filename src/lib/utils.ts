/**
 * @file utils.ts
 * @description General utility functions for the application.
 * Provides common helpers used across components.
 *
 * @exports cn - Class name merging utility for Tailwind CSS
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class name string
 *
 * @example
 * ```ts
 * cn('px-2 py-1', condition && 'bg-primary', className)
 * cn('text-sm', { 'font-bold': isBold })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

