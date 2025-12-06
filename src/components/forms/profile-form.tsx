/**
 * @file profile-form.tsx
 * @description Profile update form component.
 * Allows users to update their display name.
 *
 * @exports ProfileForm - Profile update form component
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/validations/auth'

interface ProfileFormProps {
  /** Initial profile data */
  initialData: {
    fullName: string | null
  }
}

/**
 * Profile update form component.
 * Allows users to update their display name.
 *
 * @param props - Component props
 * @param props.initialData - Initial profile values
 * @returns Profile form JSX
 *
 * @example
 * ```tsx
 * <ProfileForm initialData={{ fullName: 'John Doe' }} />
 * ```
 */
export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
    },
  })

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to update your profile.')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-300">
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          disabled={isLoading}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading || !isDirty}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}

