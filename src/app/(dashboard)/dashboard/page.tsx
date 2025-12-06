/**
 * @file page.tsx
 * @description Main dashboard page showing welcome, actions, and recent letters.
 * Displays role-based action buttons and firm's recent demand letters.
 *
 * @exports default - Dashboard page component
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { FullPageLoader } from '@/components/shared/loading-spinner'

/**
 * Dashboard page component with action buttons and letter list.
 * Shows role-based actions and recent firm documents.
 *
 * @returns Dashboard page JSX
 */
export default async function DashboardPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <DashboardContent />
    </Suspense>
  )
}

/**
 * Dashboard content with data fetching.
 */
async function DashboardContent() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Get user's firm and role
  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single()

  if (!firmUser) {
    return null
  }

  // Get firm details
  const { data: firm } = await supabase
    .from('firms')
    .select('name')
    .eq('id', firmUser.firm_id)
    .single()

  // Get recent documents (placeholder - will be empty until documents are created)
  const { data: recentDocuments } = await supabase
    .from('documents')
    .select('id, title, status, updated_at')
    .eq('firm_id', firmUser.firm_id)
    .order('updated_at', { ascending: false })
    .limit(5)

  const displayName = profile?.full_name || user.email
  const canManageTemplates = firmUser.role === 'admin' || firmUser.role === 'attorney'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {displayName}! {firm?.name && `You're working with ${firm.name}.`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Create Demand Letter - Available to all */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Demand Letter</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Generate a new demand letter from source documents
            </p>
            <Button asChild className="w-full">
              <Link href="/letters/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Letter
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Create Template - Admin/Attorney only */}
        {canManageTemplates && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Template</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Create a reusable template for demand letters
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Letters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Demand Letters</CardTitle>
          <CardDescription>Your firm&apos;s most recent demand letters</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDocuments && recentDocuments.length > 0 ? (
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/letters/${doc.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No demand letters yet.</p>
              <p className="text-sm">Create your first demand letter to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Status badge component for document status.
 */
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    generated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    edited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    exported: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  }

  const style = statusStyles[status] || statusStyles.draft

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  )
}
