/**
 * @file layout.tsx
 * @description Layout for authentication pages (login, signup).
 * Provides a centered layout without navigation for auth flows.
 *
 * @exports default - Auth layout component
 */

/**
 * Auth layout component for login and signup pages.
 * Centers content and provides consistent auth page styling.
 *
 * @param props - Component props
 * @param props.children - Auth page content
 * @returns Auth layout JSX
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

