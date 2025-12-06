/**
 * @file client.ts
 * @description Supabase browser client for client-side operations.
 * Use this client in React Client Components for auth, data fetching,
 * and real-time subscriptions.
 *
 * @exports createClient - Creates a Supabase browser client instance
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser-side usage.
 * Use in Client Components ('use client' directive).
 *
 * @returns Supabase browser client instance
 *
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase.auth, supabase.from(), etc.
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

