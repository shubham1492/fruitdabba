'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AuthModal from '@/components/layout/AuthModal'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Admin routes get NO public navbar/footer/cart
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <AuthModal />
      <main>{children}</main>
      <Footer />
    </>
  )
}
