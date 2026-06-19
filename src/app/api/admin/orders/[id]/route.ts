import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, note } = await req.json()

    const supabase = await createAdminClient()

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    // Add tracking entry
    await supabase.from('order_tracking').insert({
      order_id: id,
      status,
      note: note || `Order status updated to ${status}`,
    })

    // Get order details for WhatsApp notification
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, total, profiles(phone, full_name)')
      .eq('id', id)
      .single()

    if (order && (status === 'shipped' || status === 'delivered')) {
      const profilesData = order.profiles as unknown as Array<{ phone: string; full_name: string }> | { phone: string; full_name: string } | null
      const profileData = Array.isArray(profilesData) ? profilesData[0] : profilesData
      const phone = profileData?.phone
      const name = profileData?.full_name

      if (phone) {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            messageType: status === 'shipped' ? 'order_shipped' : 'order_delivered',
            orderId: id,
            name,
            total: order.total,
            userId: order.user_id,
          }),
        }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Order update error:', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
