'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  LogOut,
  Bell,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/plans', label: 'Subscriptions', icon: Calendar },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className={`fixed left-0 top-0 h-full bg-forest-dark text-white flex flex-col z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`p-6 border-b border-white/10 relative ${isCollapsed ? 'flex justify-center p-4' : ''}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center text-lg shrink-0">
            🍊
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in whitespace-nowrap">
              <div className="font-bold text-sm">FruitDabba</div>
              <div className="text-white/50 text-xs">Admin Panel</div>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-orange text-white border border-white/20 flex items-center justify-center shadow-lg hover:bg-orange/90 transition-colors z-50 cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              } ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors w-full ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">Sign Out</span>}
        </button>
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1 w-full ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}`}
          title={isCollapsed ? "View Store" : undefined}
        >
          <span className="text-[18px] leading-none shrink-0">←</span>
          {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">View Store</span>}
        </Link>
      </div>
    </aside>
  )
}
