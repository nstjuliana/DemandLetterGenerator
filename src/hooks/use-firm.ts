/**
 * @file use-firm.ts
 * @description React hook for accessing current firm context.
 * Provides firm data, user role, and firm membership info.
 *
 * @exports useFirm - Hook for firm context
 */

'use client'

import { useEffect, useState, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Firm, FirmUser, UserRole } from '@/types'

interface FirmState {
  /** Current firm */
  firm: Firm | null
  /** User's role in the firm */
  role: UserRole | null
  /** Firm membership record */
  membership: FirmUser | null
  /** Whether firm data is loading */
  isLoading: boolean
  /** Refresh firm data */
  refresh: () => Promise<void>
  /** Check if user has specific role */
  hasRole: (roles: UserRole[]) => boolean
  /** Check if user is admin */
  isAdmin: boolean
  /** Check if user can manage templates */
  canManageTemplates: boolean
}

/**
 * Hook for accessing current firm context.
 * Provides firm data, user role, and helper functions.
 *
 * @returns Firm state object
 *
 * @example
 * ```tsx
 * const { firm, role, isAdmin, canManageTemplates } = useFirm()
 *
 * if (!firm) return <NoFirmMessage />
 *
 * return (
 *   <div>
 *     <h1>{firm.name}</h1>
 *     {canManageTemplates && <CreateTemplateButton />}
 *   </div>
 * )
 * ```
 */
export function useFirm(): FirmState {
  const [firm, setFirm] = useState<Firm | null>(null)
  const [membership, setMembership] = useState<FirmUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFirm(null)
      setMembership(null)
      setIsLoading(false)
      return
    }

    // Get user's firm membership
    const { data: firmUserData } = await supabase
      .from('firm_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!firmUserData) {
      setFirm(null)
      setMembership(null)
      setIsLoading(false)
      return
    }

    setMembership(firmUserData)

    // Get firm details
    const { data: firmData } = await supabase
      .from('firms')
      .select('*')
      .eq('id', firmUserData.firm_id)
      .single()

    setFirm(firmData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refresh()

    // Subscribe to auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refresh])

  const role = membership?.role ?? null

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      return role !== null && roles.includes(role)
    },
    [role]
  )

  const isAdmin = role === 'admin'
  const canManageTemplates = hasRole(['admin', 'attorney'])

  return {
    firm,
    role,
    membership,
    isLoading,
    refresh,
    hasRole,
    isAdmin,
    canManageTemplates,
  }
}

