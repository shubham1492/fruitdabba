'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Package, Sparkles, MapPin, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

const SUPPORTED_CITIES = ['Pune', 'Mumbai', 'Ahmedabad', 'Bangalore'] as const

const navLinks = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#categories', label: 'Categories' },
  { href: '/#customize', label: 'Customize' },
  { href: '/#plans', label: 'Plans' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' }
]

// Reverse geocode coordinates to the nearest supported city
function resolveCity(lat: number, lng: number): string {
  const cityCoords = [
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  ]
  let closest = cityCoords[0]
  let minDist = Infinity
  for (const c of cityCoords) {
    const d = Math.sqrt((lat - c.lat) ** 2 + (lng - c.lng) ** 2)
    if (d < minDist) { minDist = d; closest = c }
  }
  return closest.name
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  const [isCityOpen, setIsCityOpen] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const cityRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems, toggleCart } = useCartStore()
  const openAuthModal = useUIStore((state) => state.openAuthModal)
  const supabase = createClient()

  // Load saved city or auto-detect via geolocation on first visit
  useEffect(() => {
    const saved = localStorage.getItem('selected_city')
    if (saved) {
      setSelectedCity(saved)
    } else {
      // Try geolocation on first visit
      if ('geolocation' in navigator) {
        setDetectingLocation(true)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const city = resolveCity(pos.coords.latitude, pos.coords.longitude)
            setSelectedCity(city)
            localStorage.setItem('selected_city', city)
            window.dispatchEvent(new CustomEvent('cityChanged', { detail: city }))
            setDetectingLocation(false)
            toast.success(`📍 Detected your location: ${city}`)
          },
          () => {
            // Geolocation denied or failed — default to Bangalore
            localStorage.setItem('selected_city', 'Bangalore')
            setDetectingLocation(false)
          },
          { timeout: 5000 }
        )
      } else {
        localStorage.setItem('selected_city', 'Bangalore')
      }
    }
  }, [])

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    localStorage.setItem('selected_city', city)
    window.dispatchEvent(new CustomEvent('cityChanged', { detail: city }))
    setIsCityOpen(false)
    toast.success(`Delivering to ${city} 🚚`)
  }

  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = resolveCity(pos.coords.latitude, pos.coords.longitude)
        handleCityChange(city)
        setDetectingLocation(false)
      },
      () => {
        toast.error('Could not detect location. Please select manually.')
        setDetectingLocation(false)
      },
      { timeout: 5000 }
    )
  }

  useEffect(() => {
    setHasMounted(true)
    
    async function checkRole(currentUser: SupabaseUser | null) {
      if (!currentUser) { setIsAdmin(false); return }
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
        setIsAdmin(profile?.role === 'admin')
      } catch { setIsAdmin(false) }
    }

    async function loadUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      checkRole(currentUser)
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      checkRole(currentUser)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const isCheckoutOrInvoice = pathname?.startsWith('/checkout') || pathname?.startsWith('/invoice')

  if (isCheckoutOrInvoice) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-forest text-white font-bold text-base shadow-md">
              🍊
            </span>
            <span className="font-heading text-lg font-extrabold tracking-tight text-gray-900">
              Fruit<span className="text-forest">Dabba</span>
            </span>
          </Link>

          {/* Simple Link & User Dropdown */}
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-xs font-extrabold text-gray-600 hover:text-forest transition-all flex items-center gap-1 bg-cream hover:bg-cream-100 border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm"
            >
              ← Continue Shopping
            </Link>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer bg-gray-50 border border-gray-200"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#22c55e] text-white text-[10px] font-bold uppercase">
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      : 'U'}
                  </span>
                  <span className="text-xs font-bold text-gray-900 pr-1.5 max-w-[80px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <User size={16} className="text-primary" /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <Package size={16} className="text-primary" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard size={16} className="text-primary" /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <div className="w-full">
      {/* Top Announcement Banner with City Selector */}
      <div className="bg-gray-950 text-white py-1.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-between relative z-50">
        {/* City Selector (left side) */}
        <div ref={cityRef} className="relative flex items-center">
          <button
            onClick={() => setIsCityOpen(!isCityOpen)}
            className="flex items-center gap-1 text-[11px] font-bold text-white/90 hover:text-white bg-white/10 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-white/10 hover:border-white/25"
          >
            <MapPin className="size-3" />
            <span>{detectingLocation ? 'Detecting...' : selectedCity}</span>
            <ChevronDown className={`size-3 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCityOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-fade-in">
              {/* Detect location button */}
              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-forest hover:bg-cream transition-colors text-left cursor-pointer border-b border-gray-100 disabled:opacity-50"
              >
                <MapPin className="size-3.5" />
                <span>{detectingLocation ? 'Detecting...' : 'Use my location'}</span>
              </button>

              {SUPPORTED_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold hover:bg-cream transition-colors text-left cursor-pointer ${
                    selectedCity === city ? 'text-forest bg-forest/5' : 'text-gray-700'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity === city && <span className="text-forest text-sm">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center promo text */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 shrink-0 text-primary animate-pulse" />
          <span className="text-[11px] sm:text-xs">30% off first box · use code</span>
          <span className="bg-primary/20 text-primary border border-primary/30 font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md tracking-widest select-all cursor-pointer" title="Click to copy code">
            FIRSTBOX30
          </span>
          <span className="text-[11px] sm:text-xs hidden sm:inline">at checkout</span>
        </div>

        {/* WhatsApp CTA (small in banner) */}
        <a
          href="https://wa.me/919595579336?text=Hi%20FruitDabba!%20I'd%20like%20to%20start%20a%20fruit%20subscription."
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#25D366] hover:bg-[#1ebe5b] px-2.5 py-1 rounded-full transition-all"
        >
          <span>💬</span>
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-base shadow-md">
              🍊
            </span>
            <span className="font-heading text-lg font-extrabold tracking-tight text-gray-900">
              Fruit<span className="text-primary">Dabba</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-semibold text-gray-600 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              id="cart-toggle-btn"
              onClick={toggleCart}
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200"
            >
              <ShoppingBag className="size-[18px]" />
              {hasMounted && totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems() > 9 ? '9+' : totalItems()}
                </span>
              )}
            </button>

            {/* User Info / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer bg-gray-50 border border-gray-200"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#22c55e] text-white text-[10px] font-bold uppercase">
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      : 'U'}
                  </span>
                  <span className="text-xs font-bold text-gray-900 pr-1.5 max-w-[80px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <User size={16} className="text-primary" /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      <Package size={16} className="text-primary" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard size={16} className="text-primary" /> Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="hidden md:flex btn-primary bg-primary hover:bg-primary/95 text-white py-1.5 px-3.5 cursor-pointer text-[11px] rounded-xl font-bold"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 p-4 shadow-lg flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-3 text-gray-700 font-semibold hover:text-primary rounded-lg hover:bg-cream transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <button
                onClick={() => { setIsMenuOpen(false); openAuthModal() }}
                className="block mt-2 btn-primary bg-primary text-center w-full cursor-pointer text-xs rounded-xl py-2.5"
              >
                Sign In
              </button>
            )}
            <a
              href="https://wa.me/919595579336?text=Hi%20FruitDabba!%20I'd%20like%20to%20start%20a%20fruit%20subscription."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 mt-2 py-2.5 text-xs font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#1ebe5b] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        )}
      </header>
    </div>
  )
}

