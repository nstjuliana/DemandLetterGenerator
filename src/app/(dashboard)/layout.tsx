/**
 * @file layout.tsx
 * @description Layout for dashboard pages (protected routes).
 * Provides navigation shell with header and optional sidebar.
 *
 * @exports default - Dashboard layout component
 */

import { Header } from '@/components/layout/header'

/**
 * Dashboard layout component for protected pages.
 * Includes header with navigation and user menu.
 *
 * @param props - Component props
 * @param props.children - Dashboard page content
 * @returns Dashboard layout JSX
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <Header />

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  )
}
