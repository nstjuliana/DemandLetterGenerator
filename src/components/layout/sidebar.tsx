/**
 * @file sidebar.tsx
 * @description Dashboard sidebar component (optional).
 * Can be used for additional navigation or tools.
 * Currently a placeholder for future expansion.
 *
 * @exports Sidebar - Dashboard sidebar component
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Files, Settings } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useFirm } from '@/hooks/use-firm'

interface SidebarItem {
  href: string
  label: string
  icon: React.ElementType
  requiresTemplateAccess?: boolean
}

const sidebarItems: SidebarItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/letters', label: 'Letters', icon: FileText },
  { href: '/templates', label: 'Templates', icon: Files },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Dashboard sidebar component with navigation links.
 * Displays icons and labels for main sections.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Sidebar JSX
 *
 * @example
 * ```tsx
 * <Sidebar className="hidden md:flex" />
 * ```
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { canManageTemplates } = useFirm()

  return (
    <aside className={cn('flex w-64 flex-col border-r bg-background', className)}>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          // Hide templates for users without access (optional - they can still view)
          if (item.requiresTemplateAccess && !canManageTemplates) {
            return null
          }

          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

