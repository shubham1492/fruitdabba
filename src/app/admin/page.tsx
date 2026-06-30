'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const CITIES = ['All', 'Pune', 'Mumbai', 'Ahmedabad', 'Bangalore'] as const
const CITY_COLORS: Record<string, string> = {
  Pune: 'bg-purple-100 text-purple-700',
  Mumbai: 'bg-blue-100 text-blue-700',
  Ahmedabad: 'bg-orange-100 text-orange-700',
  Bangalore: 'bg-green-100 text-green-700',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const supabase = createClient()

export default function AdminDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  })
  const [cityBreakdown, setCityBreakdown] = useState<{ city: string; revenue: number; orders: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Fetch all orders with city info (including addresses table join)
    const [
      { data: rawOrders },
      { count: totalCustomers },
      { count: totalProducts },
      { data: subscriptions },
      { data: rawOrdersForBreakdown },
    ] = await Promise.all([
      supabase.from('orders')
        .select('*, profiles(full_name), addresses(city)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions')
        .select('*, profiles(full_name), subscription_plans(name), addresses(city)')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase.from('orders').select('total, city, payment_status, addresses(city)').eq('payment_status', 'paid'),
    ])

    const normalizeCity = (c: string) => {
      if (!c) return 'Bangalore'
      if (c.toLowerCase() === 'bengaluru') return 'Bangalore'
      return c
    }

    // Map raw orders to resolve the city correctly
    const resolvedOrders = (rawOrders || []).map((o: any) => ({
      ...o,
      city: normalizeCity(o.city || o.addresses?.city || o.address?.city)
    }))

    const resolvedOrdersForBreakdown = (rawOrdersForBreakdown || []).map((o: any) => ({
      ...o,
      city: normalizeCity(o.city || o.addresses?.city || o.address?.city)
    }))


    // Calculate stats
    let filteredRevenue = resolvedOrdersForBreakdown
    if (selectedCity !== 'All') {
      filteredRevenue = resolvedOrdersForBreakdown.filter((o: any) => o.city === selectedCity)
    }
    const totalRevenue = filteredRevenue.reduce((sum: number, o: any) => sum + Number(o.total), 0)
    const totalOrders = selectedCity === 'All'
      ? resolvedOrdersForBreakdown.length
      : filteredRevenue.length

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
    })

    // City breakdown
    const cityMap = new Map<string, { revenue: number; orders: number }>()
    for (const city of ['Pune', 'Mumbai', 'Ahmedabad', 'Bangalore']) {
      cityMap.set(city, { revenue: 0, orders: 0 })
    }
    for (const o of resolvedOrdersForBreakdown) {
      const city = o.city || 'Unknown'
      const existing = cityMap.get(city) || { revenue: 0, orders: 0 }
      existing.revenue += Number(o.total)
      existing.orders += 1
      cityMap.set(city, existing)
    }
    setCityBreakdown(
      Array.from(cityMap.entries()).map(([city, data]) => ({ city, ...data }))
    )

    // Filter recent orders list based on selected city
    let displayRecent = resolvedOrders
    if (selectedCity !== 'All') {
      displayRecent = resolvedOrders.filter((o: any) => o.city === selectedCity)
    }

    // Filter subscriptions by city if needed
    let filteredSubs = subscriptions || []
    if (selectedCity !== 'All') {
      filteredSubs = filteredSubs.filter((s: any) =>
        (s.addresses as any)?.city === selectedCity
      )
    }

    setRecentOrders(displayRecent.slice(0, 10))
    setActiveSubscriptions(filteredSubs)
    setLoading(false)
  }, [selectedCity])


  useEffect(() => { fetchData() }, [fetchData])

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      sub: selectedCity === 'All' ? 'All cities' : selectedCity,
    },
    {
      label: 'Total Orders',
      value: String(stats.totalOrders),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      sub: selectedCity === 'All' ? 'All cities' : selectedCity,
    },
    {
      label: 'Customers',
      value: String(stats.totalCustomers),
      icon: Users,
      color: 'bg-purple-500',
      sub: 'Registered',
    },
    {
      label: 'Products',
      value: String(stats.totalProducts),
      icon: Package,
      color: 'bg-orange-500',
      sub: 'In catalog',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-forest" size={32} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {statCards.map((stat) => (
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

          {/* City Breakdown */}
          {selectedCity === 'All' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {cityBreakdown.map((cb) => (
                <button
                  key={cb.city}
                  onClick={() => setSelectedCity(cb.city)}
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:border-forest/30 hover:shadow-card-hover transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CITY_COLORS[cb.city] || 'bg-gray-100 text-gray-700'}`}>
                      📍 {cb.city}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">₹{cb.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">{cb.orders} orders</p>
                    </div>
                    <span className="text-xs text-forest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
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
              <h2 className="font-bold text-gray-900">
                Recent Orders
                {selectedCity !== 'All' && (
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${CITY_COLORS[selectedCity] || ''}`}>
                    {selectedCity}
                  </span>
                )}
              </h2>
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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">City</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(order.profiles as { full_name: string } | null)?.full_name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {order.city ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CITY_COLORS[order.city] || 'bg-gray-100 text-gray-700'}`}>
                            {order.city}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No orders {selectedCity !== 'All' ? `in ${selectedCity}` : 'yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mt-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  Active Subscriptions & Packing Directives
                  {selectedCity !== 'All' && (
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${CITY_COLORS[selectedCity] || ''}`}>
                      {selectedCity}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Custom taste preferences and add-ons configured by customers for sorting boxes</p>
              </div>
              <span className="text-xs font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/25 px-3 py-1 rounded-full">
                {activeSubscriptions.length} Active
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">City</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Plan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Delivery & Add-ons</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Preferred Likes</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Dislikes</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubscriptions.map((sub: any) => {
                    const prefs = sub.preferences || {}
                    const likes = Array.isArray(prefs.likes) ? prefs.likes : []
                    const dislikes = Array.isArray(prefs.dislikes) ? prefs.dislikes : []
                    const deliverySlot = prefs.deliverySlot || 'morning'
                    const categories = Array.isArray(prefs.categories) ? prefs.categories : []
                    const addons = Array.isArray(prefs.addons) ? prefs.addons : []
                    const familySize = prefs.familySize ? prefs.familySize.replace('-', ' ') : ''
                    const portionAdjustment = prefs.portionAdjustment || 'standard'
                    const subCity = (sub.addresses as any)?.city || sub.address?.city || '—'

                    return (
                      <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {(sub.profiles as { full_name: string } | null)?.full_name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {subCity !== '—' ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CITY_COLORS[subCity] || 'bg-gray-100 text-gray-700'}`}>
                              {subCity}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(sub.subscription_plans as { name: string } | null)?.name || 'Custom Subscription'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                          <div className="capitalize"><span className="text-gray-400">Slot:</span> {deliverySlot}</div>
                          {portionAdjustment === 'reduced' && (
                            <div className="text-[10px] text-red-600 font-extrabold bg-red-50 border border-red-200 rounded px-1.5 py-0.5 inline-block animate-pulse">
                              ⚠️ REDUCED PORTION (Pack 50-70g LESS)
                            </div>
                          )}
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
                  {activeSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                        No active subscriptions {selectedCity !== 'All' ? `in ${selectedCity}` : 'yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
