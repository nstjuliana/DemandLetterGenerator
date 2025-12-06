/**
 * @file page.tsx
 * @description Landing page for the Demand Letter Generator application.
 * Provides entry point with navigation to login/signup.
 *
 * @exports default - Landing page component
 */

import Link from 'next/link'

/**
 * Landing page component displaying welcome message and auth navigation.
 *
 * @returns The landing page JSX
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Demand Letter Generator</h1>
        <p className="mb-8 text-muted-foreground">
          AI-powered demand letter generation for law firms
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}
