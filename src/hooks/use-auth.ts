/**
 * @file use-auth.ts
 * @description React hook for accessing authentication state.
 * Provides current user, loading state, and auth actions.
 *
 * @exports useAuth - Hook for auth state and actions
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthState {
  /** Current authenticated user */
  user: User | null
  /** User profile from database */
  profile: Profile | null
  /** Whether auth state is loading */
  isLoading: boolean
  /** Sign out function */
  signOut: () => Promise<void>
  /** Refresh auth state */
  refresh: () => Promise<void>
}

/**
 * Hook for accessing authentication state and actions.
 * Provides current user, profile, loading state, and auth functions.
 *
 * @returns Auth state object
 *
 * @example
 * ```tsx
 * const { user, profile, isLoading, signOut } = useAuth()
 *
 * if (isLoading) return <LoadingSpinner />
 * if (!user) return <LoginPrompt />
 *
 * return <div>Welcome, {profile?.full_name}</div>
 * ```
 */
export function useAuth(): AuthState {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    setUser(currentUser)

    if (currentUser) {
      await fetchProfile(currentUser.id)
    } else {
      setProfile(null)
    }

    setIsLoading(false)
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
    router.refresh()
  }, [router])

  useEffect(() => {
    // Initial fetch
    refresh()

    // Subscribe to auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refresh, fetchProfile])

  return {
    user,
    profile,
    isLoading,
    signOut,
    refresh,
  }
}

