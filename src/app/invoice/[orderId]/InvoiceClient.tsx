'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Download, Mail, Home, Loader2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Props {
  order: any
  invoiceNumber: string
  gst: number
  userEmail: string
}

export default function InvoiceClient({ order, invoiceNumber, gst, userEmail }: Props) {
  const [resending, setResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const subtotal = Number(order.subtotal)
  const delivery = Number(order.delivery_fee)
  const total = subtotal + delivery + gst

  const handleDownload = () => {
    window.print()
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch('/api/invoice/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, email: userEmail }),
      })
      if (res.ok) {
        setEmailSent(true)
        toast.success('Invoice resent to your email!')
      } else {
        toast.error('Failed to resend invoice')
      }
    } catch {
      toast.error('Failed to resend invoice')
    } finally {
      setResending(false)
    }
  }

  const planName = order.subscription_plan_name || order.order_items?.[0]?.product_name || 'Fruit Subscription'
  const timeSlot = order.preferences?.timeSlot || '8 – 10 AM'
  const paymentMethod = order.payment_method || order.preferences?.paymentMethod || 'UPI'

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Success banner */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-center gap-2.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-5 py-2.5 text-sm font-semibold text-[#22c55e]">
          <Mail size={15} />
          Invoice {invoiceNumber} emailed to {userEmail}
        </div>
      </div>

      {/* Invoice Card */}
      <div id="invoice-card" className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-start justify-between">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🍊</span>
                  <span className="text-xl font-extrabold">Fruit<span className="text-[#22c55e]">Dabba</span></span>
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  <div>FruitDabba Pvt. Ltd.</div>
                  <div>Koramangala, Bangalore 560034</div>
                  <div>care@fruitdabba.in · +91 75981 66088</div>
                </div>
              </div>
              {/* Invoice meta */}
              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide mb-1">INVOICE</div>
                <div className="text-sm font-bold text-gray-700">{invoiceNumber}</div>
                <div className="text-xs text-gray-400 mt-0.5">{format(new Date(order.created_at), 'dd MMM yyyy')}</div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-xs font-extrabold uppercase tracking-wider border border-[#22c55e]/20">
                  PAID
                </div>
              </div>
            </div>
          </div>

          {/* Billed To + Delivery */}
          <div className="px-8 py-5 grid grid-cols-2 gap-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">Billed To</div>
              <div className="font-bold text-gray-900 text-sm">{order.customer_name || order.shipping_address?.name || 'Valued Customer'}</div>
              <div className="text-xs text-gray-500 mt-0.5">{userEmail}</div>
              {order.shipping_address && (
                <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}<br />
                  {order.shipping_address.city}, {order.shipping_address.pincode}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">Delivery</div>
              <div className="text-xs text-gray-700 leading-relaxed space-y-0.5">
                <div>Delivered every month · {timeSlot}</div>
                <div>Payment: <span className="font-semibold capitalize">{paymentMethod.toUpperCase()}</span></div>
                {order.preferences?.startDate && (
                  <div>Starts: <span className="font-semibold">{format(new Date(order.preferences.startDate), 'dd MMM yyyy')}</span></div>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-5">
            <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">
              <span>Description</span><span>Amount</span>
            </div>

            {/* Main subscription line */}
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div className="flex-1 pr-4">
                <div className="font-bold text-gray-900 text-sm">{planName}</div>
                {order.order_items?.slice(0, 1).map((item: any) => (
                  <div key={item.id} className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {item.product_name || planName}
                  </div>
                ))}
                {order.preferences?.likes?.length > 0 && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {order.preferences.likes.join(', ')}
                  </div>
                )}
              </div>
              <div className="font-bold text-gray-900 text-sm shrink-0">₹{subtotal.toLocaleString()}</div>
            </div>

            {/* Delivery */}
            <div className="flex justify-between py-3 border-b border-gray-100 text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className={delivery === 0 ? 'text-[#22c55e] font-semibold' : 'text-gray-900'}>
                {delivery === 0 ? 'Free' : `₹${delivery}`}
              </span>
            </div>

            {/* GST */}
            <div className="flex justify-between py-3 border-b border-gray-100 text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span className="text-gray-900">₹{gst}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between py-4 text-base">
              <span className="font-extrabold text-gray-900">Total paid</span>
              <span className="font-extrabold text-[#22c55e] text-lg">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mx-8 mb-8 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Thank you for subscribing to FruitDabba — fresh, handpicked fruit, delivered on schedule.
              This is a computer-generated invoice.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-2xl mx-auto px-4 mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-green-600 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-sm text-sm"
        >
          <Download size={16} /> Download Invoice
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || emailSent}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-bold py-3.5 rounded-2xl transition-all text-sm"
        >
          {resending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {emailSent ? 'Email Sent ✓' : 'Resend Email'}
        </button>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition-all text-sm"
        >
          <Home size={16} /> Back to Home
        </Link>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
