/**
 * @file nav-menu.tsx
 * @description Navigation menu component for dashboard.
 * Displays links to main sections with active state.
 *
 * @exports NavMenu - Navigation menu component
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/letters', label: 'Letters' },
  { href: '/templates', label: 'Templates' },
]

/**
 * Navigation menu component with active state handling.
 * Displays links to main dashboard sections.
 *
 * @returns Navigation menu JSX
 *
 * @example
 * ```tsx
 * <NavMenu />
 * ```
 */
export function NavMenu() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground/80',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

