import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/auth-context'
import { SolutionsProvider } from '@/context/solutions-context'
import './globals.css'


export const metadata: Metadata = {
  title: 'SolveBase | Solution Reusability & Validation Platform',
  description: 'Submit, validate, review, and discover reusable software solutions. Enterprise-grade platform for teams.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SolutionsProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SolutionsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
