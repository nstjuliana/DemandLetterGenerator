/**
 * @file label.tsx
 * @description Accessible label component for form fields.
 * Built on Radix UI Label primitive.
 *
 * @exports Label - Form label component
 */

'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

/**
 * Label component for form fields.
 *
 * @param props - Label props
 * @returns Styled label element
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" />
 * ```
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

