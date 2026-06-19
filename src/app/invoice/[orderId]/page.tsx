export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import InvoiceClient from './InvoiceClient'

export const metadata: Metadata = { title: 'Invoice | FruitDabba' }

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const invoiceNumber = `FD-${format(new Date(order.created_at), 'yyyyMMdd')}-${orderId.slice(0, 4).toUpperCase()}`
  const gst = Math.round(Number(order.subtotal) * 0.05)

  return (
    <InvoiceClient
      order={order}
      invoiceNumber={invoiceNumber}
      gst={gst}
      userEmail={user.email || ''}
    />
  )
}
