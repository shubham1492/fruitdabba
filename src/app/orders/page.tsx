export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, ChevronRight, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Orders' }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const STATUS_EMOJI: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  processing: '🔄',
  shipped: '🚚',
  delivered: '🎉',
  cancelled: '❌',
  refunded: '💸',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(product_name, quantity, unit_price)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">{orders?.length || 0} total orders</p>
          </div>
          <Link href="/products" className="btn-outline text-sm py-2 px-4">
            Shop Again
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-700">No orders yet</h2>
            <p className="text-gray-400 mt-2 mb-8">Your orders will appear here once you make a purchase.</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              <Package size={18} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as any[]).map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block card p-5 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-xl">
                      {STATUS_EMOJI[order.status] || '📦'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {order.order_items?.slice(0, 3).map((item: { product_name: string; quantity: number }) =>
                          `${item.product_name} ×${item.quantity}`
                        ).join(', ')}
                        {order.order_items?.length > 3 && ` +${order.order_items.length - 3} more`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-forest text-lg">₹{order.total}</div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-forest transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
