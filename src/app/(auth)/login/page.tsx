/**
 * @file page.tsx
 * @description Login page for user authentication.
 * Uses LoginForm component with Supabase Auth integration.
 *
 * @exports default - Login page component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/login-form'

/**
 * Login page component with email/password form.
 *
 * @returns Login page JSX
 */
export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
