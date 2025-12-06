/**
 * @file middleware.ts
 * @description Supabase middleware client for session refresh and route protection.
 * Used in Next.js middleware to refresh auth sessions and protect routes.
 *
 * @exports updateSession - Refreshes the Supabase auth session and handles route protection
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/letters', '/templates', '/settings']

// Routes only accessible to unauthenticated users
const AUTH_ROUTES = ['/login', '/signup']

/**
 * Updates the Supabase auth session and handles route protection.
 * Should be called in the main middleware to keep sessions fresh
 * and protect routes based on authentication status.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated cookies and potential redirects
 *
 * @example
 * ```ts
 * // In src/middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip Supabase session refresh if env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  // Check if route is auth-only (login/signup)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user && !pathname.includes('/signup/firm')) {
    // Check if user has a firm before redirecting
    const { data: firmUser } = await supabase
      .from('firm_users')
      .select('firm_id')
      .eq('user_id', user.id)
      .single()

    if (firmUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else if (!pathname.includes('/signup/firm')) {
      // Redirect to firm setup if no firm
      return NextResponse.redirect(new URL('/signup/firm', request.url))
    }
  }

  // Check if authenticated user has a firm when accessing protected routes
  if (isProtectedRoute && user) {
    const { data: firmUser } = await supabase
      .from('firm_users')
      .select('firm_id')
      .eq('user_id', user.id)
      .single()

    if (!firmUser) {
      return NextResponse.redirect(new URL('/signup/firm', request.url))
    }
  }

  return supabaseResponse
}
