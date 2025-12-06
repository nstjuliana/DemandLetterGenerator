/**
 * @file firm-setup-form.tsx
 * @description Form for creating or joining a firm after signup.
 * Allows users to either create a new firm (becoming admin) or join existing.
 *
 * @exports FirmSetupForm - Firm setup form component
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
import {
  firmCreateSchema,
  firmJoinSchema,
  type FirmCreateFormData,
  type FirmJoinFormData,
} from '@/validations/auth'

type FormMode = 'create' | 'join'

/**
 * Firm setup form for post-signup flow.
 * Allows creating a new firm or joining via invite code.
 *
 * @returns Firm setup form JSX
 *
 * @example
 * ```tsx
 * <FirmSetupForm />
 * ```
 */
export function FirmSetupForm() {
  const router = useRouter()
  const [mode, setMode] = useState<FormMode>('create')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Create firm form
  const createForm = useForm<FirmCreateFormData>({
    resolver: zodResolver(firmCreateSchema),
    defaultValues: {
      name: '',
    },
  })

  // Join firm form
  const joinForm = useForm<FirmJoinFormData>({
    resolver: zodResolver(firmJoinSchema),
    defaultValues: {
      inviteCode: '',
    },
  })

  const handleCreateFirm = async (data: FirmCreateFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to create a firm.')
        return
      }

      // Create the firm
      const { data: firm, error: firmError } = await supabase
        .from('firms')
        .insert({ name: data.name })
        .select()
        .single()

      if (firmError) {
        setError(firmError.message)
        return
      }

      // Add user as admin of the firm
      const { error: memberError } = await supabase.from('firm_users').insert({
        firm_id: firm.id,
        user_id: user.id,
        role: 'admin',
      })

      if (memberError) {
        setError(memberError.message)
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinFirm = async (data: FirmJoinFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to join a firm.')
        return
      }

      // Find firm by invite code
      const { data: firm, error: firmError } = await supabase
        .from('firms')
        .select()
        .eq('invite_code', data.inviteCode)
        .single()

      if (firmError || !firm) {
        setError('Invalid invite code. Please check and try again.')
        return
      }

      // Add user as paralegal (default role) to the firm
      const { error: memberError } = await supabase.from('firm_users').insert({
        firm_id: firm.id,
        user_id: user.id,
        role: 'paralegal',
      })

      if (memberError) {
        if (memberError.code === '23505') {
          setError('You are already a member of this firm.')
        } else {
          setError(memberError.message)
        }
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border p-1">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Create Firm
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Join Firm
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create Firm Form */}
      {mode === 'create' && (
        <form onSubmit={createForm.handleSubmit(handleCreateFirm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmName">Firm Name</Label>
            <Input
              id="firmName"
              type="text"
              placeholder="Acme Law Firm"
              disabled={isLoading}
              {...createForm.register('name')}
            />
            {createForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            You will be the administrator of this firm and can invite others.
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating firm...' : 'Create Firm'}
          </Button>
        </form>
      )}

      {/* Join Firm Form */}
      {mode === 'join' && (
        <form onSubmit={joinForm.handleSubmit(handleJoinFirm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Enter 12-character invite code"
              disabled={isLoading}
              {...joinForm.register('inviteCode')}
            />
            {joinForm.formState.errors.inviteCode && (
              <p className="text-sm text-destructive">
                {joinForm.formState.errors.inviteCode.message}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Ask your firm administrator for the invite code.
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Joining firm...' : 'Join Firm'}
          </Button>
        </form>
      )}
    </div>
  )
}

