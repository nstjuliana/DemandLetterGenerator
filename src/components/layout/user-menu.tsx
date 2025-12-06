/**
 * @file user-menu.tsx
 * @description User dropdown menu component for dashboard.
 * Displays user info and provides logout functionality.
 *
 * @exports UserMenu - User menu component
 */

'use client'

import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useFirm } from '@/hooks/use-firm'

/**
 * User dropdown menu component.
 * Shows user profile info and actions like settings and logout.
 *
 * @returns User menu JSX
 *
 * @example
 * ```tsx
 * <UserMenu />
 * ```
 */
export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const { firm, role } = useFirm()

  const displayName = profile?.full_name || user?.email || 'User'
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline-block">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            {firm && (
              <p className="text-xs leading-none text-muted-foreground">
                {firm.name} • {roleDisplay}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

