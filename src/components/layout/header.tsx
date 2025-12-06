/**
 * @file header.tsx
 * @description Dashboard header component with logo and user menu.
 * Displays application branding and user controls.
 *
 * @exports Header - Dashboard header component
 */

import Link from 'next/link'

import { NavMenu } from '@/components/layout/nav-menu'
import { UserMenu } from '@/components/layout/user-menu'

/**
 * Dashboard header component.
 * Contains logo, navigation menu, and user menu.
 *
 * @returns Header JSX
 *
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Demand Letter Generator</span>
          </Link>
        </div>

        {/* Navigation */}
        <NavMenu />

        {/* User Menu */}
        <div className="ml-auto flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

