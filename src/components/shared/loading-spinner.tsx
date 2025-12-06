/**
 * @file loading-spinner.tsx
 * @description Loading spinner component for async operations.
 * Displays a centered spinning indicator.
 *
 * @exports LoadingSpinner - Loading spinner component
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

/**
 * Loading spinner component.
 * Displays an animated spinning indicator.
 *
 * @param props - Component props
 * @param props.size - Size of spinner (sm, md, lg)
 * @param props.className - Additional CSS classes
 * @returns Loading spinner JSX
 *
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" />
 * ```
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
          sizeClasses[size]
        )}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

/**
 * Full page loading spinner.
 * Centers the spinner in the viewport.
 *
 * @returns Full page loading JSX
 */
export function FullPageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

