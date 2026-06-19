import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

interface CartItem {
  id: string
  name: string
  price: number
  unit: string
  image_url: string | null
  quantity: number
}

interface AddressData {
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      planId,
      planDurationDays,
      address,
      total,
      subtotal,
      delivery,
      userId,
      preferences,
    }: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      cartItems: CartItem[]
      planId?: string | null
      planDurationDays?: number | null
      address: AddressData
      total: number
      subtotal: number
      delivery: number
      userId: string
      preferences?: any
    } = await req.json()

    // 1. Verify signature
    const isMockMode = !process.env.RAZORPAY_KEY_SECRET || 
                       process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret' ||
                       (razorpay_order_id && razorpay_order_id.startsWith('mock_'))

    if (!isMockMode) {
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
      }
    }

    const supabase = await createAdminClient()

    // Resolve planId slug to UUID if needed
    let actualPlanId = planId
    if (planId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId)) {
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('slug', planId)
        .single()
      if (planData) {
        actualPlanId = planData.id
      }
    }

    // 2. Save address
    const { data: savedAddress } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        line1: address.line1,
        line2: address.line2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        label: 'Delivery',
      })
      .select()
      .single()

    // 2.5 Create subscription record if planId is provided
    let subscriptionId = null
    if (actualPlanId) {
      const days = planDurationDays || 30
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + days)

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: actualPlanId,
          address_id: savedAddress?.id || null,
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          preferences: preferences || null,
        })
        .select()
        .single()

      if (subError) throw subError
      subscriptionId = subData?.id || null
    }

    // 3. Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        address_id: savedAddress?.id || null,
        subtotal,
        delivery_fee: delivery,
        discount: 0,
        total,
        status: 'confirmed',
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })
      .select()
      .single()

    if (!order) throw new Error('Failed to create order')

    // 4. Create order items
    if (cartItems && cartItems.length > 0) {
      await supabase.from('order_items').insert(
        cartItems.map((item: CartItem) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image_url,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))
      )
    } else if (actualPlanId) {
      // Get plan name for the subscription order item description
      const { data: planInfo } = await supabase
        .from('subscription_plans')
        .select('name')
        .eq('id', actualPlanId)
        .single()

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_name: planInfo?.name || 'Fruit Subscription Plan',
        quantity: 1,
        unit_price: subtotal,
        total_price: subtotal,
      })
    }

    // 5. Add initial tracking entry
    await supabase.from('order_tracking').insert({
      order_id: order.id,
      status: 'confirmed',
      note: planId ? 'Subscription activated. Payment received.' : 'Payment received. Order confirmed.',
    })

    // 6. Send WhatsApp notification (fire and forget)
    const profile = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', userId)
      .single()

    const phone = profile.data?.phone || address.phone
    if (phone) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          messageType: 'order_confirmed',
          orderId: order.id,
          name: profile.data?.full_name || address.name,
          total,
          userId,
        }),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err: unknown) {
    console.error('Payment verification error:', err)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
