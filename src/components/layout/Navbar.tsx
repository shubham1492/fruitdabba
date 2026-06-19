'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Package, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#categories', label: '🥗 Categories' },
  { href: '/#customize', label: 'Customize Box' },
  { href: '/#plans', label: 'Plans' },
  { href: '/#reviews', label: '⭐ Reviews' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' }
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, toggleCart } = useCartStore()
  const openAuthModal = useUIStore((state) => state.openAuthModal)
  // Stable singleton – avoids re-render loop
  const supabase = createClient()

  useEffect(() => {
    setHasMounted(true)
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const cartCount = totalItems()

  return (
    <div className="w-full">
      {/* Top Announcement Banner */}
      <div className="bg-gray-950 text-white py-2 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 relative z-50">
        <Sparkles className="size-4 shrink-0 text-primary animate-pulse" />
        <span>Get 30% off your first box + free doorstep delivery</span>
        <Link href="/#plans" className="underline font-bold text-primary hover:text-green-400 ml-1">
          Claim offer
        </Link>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-md">
              🍊
            </span>
            <span className="font-heading text-xl font-extrabold tracking-tight text-gray-900">
              Fruit<span className="text-primary">Dabba</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-600 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              id="cart-toggle-btn"
              onClick={toggleCart}
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200"
            >
              <ShoppingBag className="size-5" />
              {hasMounted && totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems() > 9 ? '9+' : totalItems()}
                </span>
              )}
            </button>

            {/* User Info / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer bg-gray-50 border border-gray-200"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#22c55e] text-white text-xs font-bold uppercase">
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                      : 'U'}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-900 pr-1 max-w-[70px] md:max-w-[120px] truncate">
                    {user.user_metadata?.full_name || 'User'}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} className="text-primary" />
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Package size={16} className="text-primary" />
                      My Orders
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-primary" />
                      Admin Dashboard
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="hidden md:flex btn-primary bg-primary hover:bg-primary/95 text-white py-2 px-4 cursor-pointer text-xs rounded-xl"
              >
                Sign In
              </button>
            )}

            {/* Order on WhatsApp */}
            <a
              href="https://wa.me/919595579336?text=Hi%20FruitDabba!%20I'd%20like%20to%20start%20a%20fruit%20subscription."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white hover:bg-[#16a34a] transition-all text-xs font-bold h-9 px-5 cursor-pointer shadow-sm"
            >
              Order on WhatsApp
            </a>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white border-t border-gray-100 p-4 shadow-lg flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-2 text-gray-700 font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  openAuthModal()
                }}
                className="block mt-2 btn-primary bg-primary text-center w-full cursor-pointer text-xs rounded-xl py-2.5"
              >
                Sign In
              </button>
            )}
            <a
              href="https://wa.me/919595579336?text=Hi%20FruitDabba!%20I'd%20like%20to%20start%20a%20fruit%20subscription."
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-center py-2.5 text-xs font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#1ebe5b] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Order on WhatsApp
            </a>
          </div>
        )}
      </header>
    </div>
  )
}
