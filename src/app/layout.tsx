import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

export const dynamic = 'force-dynamic'

import { Toaster } from 'react-hot-toast'
import PublicShell from '@/components/layout/PublicShell'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'FruitDabba — Fresh Fruits Delivered to Your Door',
    template: '%s | FruitDabba',
  },
  description:
    'Subscribe to India\'s freshest fruit delivery service. Hand-picked seasonal, exotic, and tropical fruits delivered to your doorstep.',
  keywords: ['fresh fruits', 'fruit delivery', 'fruit subscription', 'organic fruits', 'India'],
  openGraph: {
    title: 'FruitDabba — Fresh Fruits Delivered',
    description: 'Subscribe to India\'s freshest fruit delivery service.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-jakarta antialiased bg-cream-50 text-gray-900 min-h-screen">
        <PublicShell>
          {children}
        </PublicShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a4731',
              color: '#fff',
              fontFamily: 'var(--font-jakarta)',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
      </body>
    </html>
  )
}
