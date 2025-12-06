/**
 * @file page.tsx
 * @description Main dashboard page showing recent letters and actions.
 * Placeholder to be implemented with actual data fetching.
 *
 * @exports default - Dashboard page component
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Dashboard page component with action buttons and letter list placeholder.
 *
 * @returns Dashboard page JSX
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Demand Letter Generator. Create and manage your demand letters.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Demand Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/letters/new">Create Letter</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/templates/new">Create Template</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Letters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Demand Letters</CardTitle>
          <CardDescription>Your firm&apos;s most recent demand letters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No demand letters yet.</p>
            <p className="text-sm">
              Create your first demand letter to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

