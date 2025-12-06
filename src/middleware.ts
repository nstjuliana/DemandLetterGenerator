/**
 * @file middleware.ts
 * @description Next.js middleware for auth session management.
 * Refreshes Supabase auth sessions and can protect routes.
 *
 * @exports middleware - Main middleware function
 * @exports config - Middleware matcher configuration
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware function that runs on matched routes.
 * Currently refreshes Supabase auth session on each request.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated session cookies
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Matcher configuration for middleware.
 * Excludes static files, images, and favicon from middleware processing.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

