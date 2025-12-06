/**
 * @file page.tsx
 * @description Firm setup page after user signup.
 * Allows creating a new firm or joining existing via invite code.
 *
 * @exports default - Firm setup page component
 */

import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FirmSetupForm } from '@/components/forms/firm-setup-form'
import { createClient } from '@/lib/supabase/server'

/**
 * Firm setup page component.
 * Checks if user is authenticated and doesn't already belong to a firm.
 *
 * @returns Firm setup page JSX
 */
export default async function FirmSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check if user already belongs to a firm
  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  // Redirect to dashboard if already in a firm
  if (firmUser) {
    redirect('/dashboard')
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Set Up Your Firm</CardTitle>
        <CardDescription>
          Create a new firm or join an existing one to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FirmSetupForm />
      </CardContent>
    </Card>
  )
}

