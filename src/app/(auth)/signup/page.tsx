/**
 * @file page.tsx
 * @description Signup page for new user registration.
 * Uses SignupForm component with Supabase Auth integration.
 *
 * @exports default - Signup page component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupForm } from '@/components/forms/signup-form'

/**
 * Signup page component with registration form.
 *
 * @returns Signup page JSX
 */
export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  )
}
