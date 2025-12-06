/**
 * @file page.tsx
 * @description User settings page for profile and firm management.
 * Displays profile info, allows updates, and shows firm details.
 *
 * @exports default - Settings page component
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/forms/profile-form'
import { createClient } from '@/lib/supabase/server'
import { FullPageLoader } from '@/components/shared/loading-spinner'

/**
 * Settings page component.
 *
 * @returns Settings page JSX
 */
export default async function SettingsPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <SettingsContent />
    </Suspense>
  )
}

/**
 * Settings content with data fetching.
 */
async function SettingsContent() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's firm and role
  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single()

  // Get firm details
  const { data: firm } = firmUser
    ? await supabase.from('firms').select('*').eq('id', firmUser.firm_id).single()
    : { data: null }

  const isAdmin = firmUser?.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and firm settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* Profile Form */}
            <ProfileForm initialData={{ fullName: profile?.full_name ?? null }} />
          </CardContent>
        </Card>

        {/* Firm Section */}
        <Card>
          <CardHeader>
            <CardTitle>Firm Information</CardTitle>
            <CardDescription>Your law firm details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {firm ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Firm Name</label>
                  <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm">{firm.name}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Role</label>
                  <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm capitalize">
                    {firmUser?.role}
                  </p>
                </div>

                {/* Admin-only: Invite Code */}
                {isAdmin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite Code</label>
                    <p className="font-mono rounded-md border bg-muted/50 px-3 py-2 text-sm">
                      {firm.invite_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share this code with team members to invite them to your firm.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No firm associated with your account.</p>
            )}
          </CardContent>
        </Card>

        {/* Admin-only: Firm Management */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Firm Management</CardTitle>
              <CardDescription>Manage your firm and team members</CardDescription>
            </CardHeader>
            <CardContent>
              <FirmMembersSection firmId={firmUser?.firm_id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * Firm members section for admin users.
 */
async function FirmMembersSection({ firmId }: { firmId?: string }) {
  if (!firmId) return null

  const supabase = await createClient()

  // Get all firm members
  const { data: members } = await supabase
    .from('firm_users')
    .select(
      `
      id,
      role,
      user_id,
      created_at
    `
    )
    .eq('firm_id', firmId)
    .order('created_at', { ascending: true })

  // Get profiles for all members
  const memberIds = members?.map((m) => m.user_id) || []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', memberIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Team members in your firm ({members?.length || 0})
      </p>

      <div className="space-y-2">
        {members?.map((member) => {
          const profile = profileMap.get(member.user_id)
          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {profile?.full_name || 'Unknown User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                {member.role}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        User management features coming soon. For now, share the invite code with new team members.
      </p>
    </div>
  )
}

