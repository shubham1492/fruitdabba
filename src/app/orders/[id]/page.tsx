export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Circle, Package, Truck, Home, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Order Tracking' }

// Minimal client component just for the review button

const STATUSES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, description: 'Your order has been received and confirmed.' },
  { key: 'processing', label: 'Processing', icon: Package, description: 'We are preparing your fresh fruits.' },
  { key: 'shipped', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way!' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Order delivered successfully.' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      order_tracking(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/orders" className="flex items-center gap-2 text-gray-500 hover:text-forest mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {format(new Date(order.created_at), 'dd MMMM yyyy, h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-forest">₹{order.total}</div>
              <div className="text-xs text-gray-400 mt-1">
                Payment: <span className="text-green-600 font-medium capitalize">{order.payment_status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-8">Tracking Status</h2>

          {order.status === 'cancelled' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="font-bold text-red-600 text-xl">Order Cancelled</h3>
              <p className="text-gray-500 text-sm mt-2">This order has been cancelled.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {STATUSES.map((step, i) => {
                const isCompleted = currentStatusIndex > STATUS_ORDER.indexOf(step.key)
                const isCurrent = order.status === step.key
                const trackEntry = (order.order_tracking as Array<{ status: string; note: string | null; created_at: string }>)
                  ?.find((t) => t.status === step.key)

                return (
                  <div key={step.key} className="flex gap-5 pb-8 last:pb-0">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-forest text-white'
                          : isCurrent
                          ? 'bg-orange text-white ring-4 ring-orange/20 scale-110'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCurrent ? (
                          <Clock size={18} className="animate-pulse" />
                        ) : isCompleted ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>
                      {i < STATUSES.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${isCompleted ? 'bg-forest' : 'bg-gray-200'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pt-2 pb-4 flex-1 ${!isCompleted && !isCurrent ? 'opacity-40' : ''}`}>
                      <h3 className={`font-bold text-sm ${isCurrent ? 'text-orange' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-orange/10 text-orange px-2 py-0.5 rounded-full">Current</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                      {trackEntry && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(trackEntry.created_at), 'dd MMM, h:mm a')}
                          {trackEntry.note && ` — ${trackEntry.note}`}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-5">Items Ordered</h2>
          <div className="space-y-4">
            {(order.order_items as Array<{ id: string; product_name: string; product_image: string | null; quantity: number; unit_price: number; total_price: number }>)
              ?.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-xl shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-xl" />
                  ) : '🍎'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{item.product_name}</div>
                  <div className="text-xs text-gray-400">₹{item.unit_price} × {item.quantity}</div>
                </div>
                <div className="font-bold text-forest">₹{item.total_price}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className={order.delivery_fee === 0 ? 'text-green-600' : ''}>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-forest">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Write Review CTA — shown for delivered orders */}
        {order.status === 'delivered' && (
          <div className="mt-6 rounded-3xl bg-gradient-to-br from-forest to-forest-dark p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">⭐</div>
              <div className="flex-1">
                <h3 className="font-extrabold text-lg text-white mb-1">How was your order?</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Share your experience and help other customers discover the freshness of FruitDabba. Upload a photo of your delivery!
                </p>
                <a
                  href="/#reviews"
                  className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  📸 Write a Review &amp; Upload Photo
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
