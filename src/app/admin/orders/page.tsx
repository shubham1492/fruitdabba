'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
  city?: string | null
  profiles?: { full_name: string | null } | null
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const CITIES = ['All', 'Pune', 'Mumbai', 'Ahmedabad', 'Bangalore'] as const

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const CITY_COLORS: Record<string, string> = {
  Pune: 'bg-purple-100 text-purple-700',
  Mumbai: 'bg-blue-100 text-blue-700',
  Ahmedabad: 'bg-orange-100 text-orange-700',
  Bangalore: 'bg-green-100 text-green-700',
}

// Stable singleton – avoids re-render loop
const supabase = createClient()

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('All')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, profiles(full_name), addresses(city)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data } = await query
    
    const normalizeCity = (c: string) => {
      if (!c) return 'Bangalore'
      if (c.toLowerCase() === 'bengaluru') return 'Bangalore'
      return c
    }

    // Resolve city and filter client-side
    const mapped = (data || []).map((o: any) => ({
      ...o,
      city: normalizeCity(o.city || o.addresses?.city || o.address?.city)
    }))


    const filtered = cityFilter === 'All' 
      ? mapped 
      : mapped.filter((o: any) => o.city === cityFilter)

    setOrders(filtered)
    setLoading(false)
  }, [statusFilter, cityFilter])


  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Order status updated')
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  // Count orders per city for the badges
  const cityCounts = orders.reduce((acc, o) => {
    const c = o.city || 'Unknown'
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders{cityFilter !== 'All' ? ` in ${cityFilter}` : ''}</p>
        </div>
      </div>

      {/* City filter */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={15} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-500">City:</span>
        <div className="flex gap-1.5">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cityFilter === city
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-forest/30'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize cursor-pointer ${
              statusFilter === s ? 'bg-forest text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Order</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">City</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Total</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-forest" /></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders{cityFilter !== 'All' ? ` in ${cityFilter}` : ''}</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(order.profiles as { full_name: string | null } | null)?.full_name || '—'}
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
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest bg-white"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {updating === order.id && <Loader2 size={14} className="animate-spin text-forest" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
