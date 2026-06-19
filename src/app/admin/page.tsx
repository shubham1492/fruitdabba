export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalOrders },
    { count: totalUsers },
    { count: totalProducts },
    { data: recentOrders },
    { data: revenue },
    { data: activeSubscriptions },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders')
      .select('total')
      .eq('payment_status', 'paid'),
    supabase.from('subscriptions')
      .select('*, profiles(full_name), subscription_plans(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  const totalRevenue = (revenue as any[])?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      sub: 'All time',
    },
    {
      label: 'Total Orders',
      value: String(totalOrders || 0),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      sub: 'Lifetime',
    },
    {
      label: 'Customers',
      value: String(totalUsers || 0),
      icon: Users,
      color: 'bg-purple-500',
      sub: 'Registered',
    },
    {
      label: 'Products',
      value: String(totalProducts || 0),
      icon: Package,
      color: 'bg-orange-500',
      sub: 'In catalog',
    },
  ]

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Add Product', href: '/admin/products/new', emoji: '➕' },
          { label: 'View Orders', href: '/admin/orders', emoji: '📦' },
          { label: 'View Store', href: '/', emoji: '🏪' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:border-forest/30 hover:shadow-card-hover transition-all text-center"
          >
            <div className="text-2xl mb-1.5">{action.emoji}</div>
            <div className="text-sm font-semibold text-gray-700">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-forest hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Order</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders as any[])?.map((order: any) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(order.profiles as { full_name: string } | null)?.full_name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(order.created_at), 'dd MMM, h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-forest">₹{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href="/admin/orders"
                      className="text-xs text-forest hover:underline font-medium"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Active Subscriptions / Customer Packing Directives */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mt-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Active Subscriptions & Packing Directives</h2>
            <p className="text-xs text-gray-400 mt-0.5">Custom taste preferences and add-ons configured by customers for sorting boxes</p>
          </div>
          <span className="text-xs font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/25 px-3 py-1 rounded-full">
            {activeSubscriptions?.length || 0} Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Delivery & Add-ons</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Preferred Likes (Include)</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Dislikes (Exclude/Swap)</th>
              </tr>
            </thead>
            <tbody>
              {(activeSubscriptions as any[])?.map((sub: any) => {
                const prefs = sub.preferences || {}
                const likes = Array.isArray(prefs.likes) ? prefs.likes : []
                const dislikes = Array.isArray(prefs.dislikes) ? prefs.dislikes : []
                const deliverySlot = prefs.deliverySlot || 'morning'
                const categories = Array.isArray(prefs.categories) ? prefs.categories : []
                const addons = Array.isArray(prefs.addons) ? prefs.addons : []
                const familySize = prefs.familySize ? prefs.familySize.replace('-', ' ') : ''

                return (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {(sub.profiles as { full_name: string } | null)?.full_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(sub.subscription_plans as { name: string } | null)?.name || 'Custom Subscription'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                      <div className="capitalize"><span className="text-gray-400">Slot:</span> {deliverySlot}</div>
                      {familySize && <div className="capitalize text-[10px]"><span className="text-gray-400">Old Portion:</span> {familySize}</div>}
                      {categories.length > 0 && (
                        <div className="text-[10px] leading-tight">
                          <span className="text-gray-400">Categories:</span> {categories.join(', ')}
                        </div>
                      )}
                      {addons.length > 0 && (
                        <div className="text-[10px] text-orange font-semibold leading-tight">
                          <span className="text-gray-400 font-normal">Add-ons:</span> {addons.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {likes.map((l: string) => (
                          <span key={l} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                            {l}
                          </span>
                        ))}
                        {likes.length === 0 && <span className="text-xs text-gray-400 italic">No specific preferences</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {dislikes.map((d: string) => (
                          <span key={d} className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">
                            {d}
                          </span>
                        ))}
                        {dislikes.length === 0 && <span className="text-xs text-gray-400 italic">None</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!activeSubscriptions || activeSubscriptions.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                    No active subscriptions setup yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
