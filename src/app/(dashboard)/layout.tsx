/**
 * @file layout.tsx
 * @description Layout for dashboard pages (protected routes).
 * Provides navigation shell with header and sidebar placeholders.
 *
 * @exports default - Dashboard layout component
 */

import Link from 'next/link'

/**
 * Dashboard layout component for protected pages.
 * Includes navigation header with links to main sections.
 *
 * @param props - Component props
 * @param props.children - Dashboard page content
 * @returns Dashboard layout JSX
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Demand Letter Generator</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/templates"
                className="transition-colors hover:text-foreground/80 text-muted-foreground"
              >
                Templates
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  )
}

