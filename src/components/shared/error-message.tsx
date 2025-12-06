/**
 * @file error-message.tsx
 * @description Error message component for displaying errors.
 * Provides consistent error styling across the app.
 *
 * @exports ErrorMessage - Error message component
 */

import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  /** Error title */
  title?: string
  /** Error message text */
  message: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Error message component with icon.
 * Displays an error with consistent styling.
 *
 * @param props - Component props
 * @param props.title - Optional error title
 * @param props.message - Error message text
 * @param props.className - Additional CSS classes
 * @returns Error message JSX
 *
 * @example
 * ```tsx
 * <ErrorMessage message="Something went wrong" />
 * <ErrorMessage title="Error" message="Failed to load data" />
 * ```
 */
export function ErrorMessage({ title, message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 text-destructive" />
      <div className="flex-1">
        {title && <h4 className="mb-1 font-medium text-destructive">{title}</h4>}
        <p className="text-sm text-destructive">{message}</p>
      </div>
    </div>
  )
}

