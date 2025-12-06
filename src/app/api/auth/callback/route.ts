/**
 * @file route.ts
 * @description Auth callback handler for OAuth and email confirmations.
 * Exchanges auth code for session and redirects appropriately.
 *
 * @exports GET - Auth callback handler
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 *
 * Handles the OAuth callback and email confirmation redirects.
 * Exchanges the auth code for a session and redirects to appropriate page.
 *
 * @param request - Next.js request object
 * @returns Redirect response
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a firm
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: firmUser } = await supabase
          .from('firm_users')
          .select('firm_id')
          .eq('user_id', user.id)
          .single()

        // Redirect to firm setup if not in a firm
        if (!firmUser) {
          return NextResponse.redirect(`${origin}/signup/firm`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

