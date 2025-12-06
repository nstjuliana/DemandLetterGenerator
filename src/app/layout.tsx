/**
 * @file layout.tsx
 * @description Root layout component for the Demand Letter Generator application.
 * Provides the HTML structure, metadata, and global styles for all pages.
 *
 * @exports RootLayout - Root layout component wrapping all pages
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Demand Letter Generator',
  description: 'AI-powered demand letter generation for law firms',
}

/**
 * Root layout component that wraps all pages in the application.
 *
 * @param props - Component props
 * @param props.children - Child components to render within the layout
 * @returns The root HTML structure with children
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
