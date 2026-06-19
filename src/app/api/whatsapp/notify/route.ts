import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

const MESSAGE_TEMPLATES: Record<string, (data: Record<string, string>) => string> = {
  order_confirmed: (d) =>
    `🎉 Hi ${d.name}! Your FruitDabba order #${d.orderId?.slice(0, 8)} has been confirmed!\n\n💰 Total: ₹${d.total}\n🚚 Your fresh fruits will be delivered soon.\n\nTrack your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${d.orderId}\n\nThank you for choosing FruitDabba! 🍎`,

  order_shipped: (d) =>
    `🚚 Great news, ${d.name}! Your FruitDabba order #${d.orderId?.slice(0, 8)} is on the way!\n\nYour fresh fruits are being delivered right now. Please be available to receive your order.\n\nTrack your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${d.orderId}`,

  order_delivered: (d) =>
    `✅ ${d.name}, your FruitDabba order has been delivered! 🎉\n\nWe hope you love your fresh fruits! Please share your experience with us.\n\nRate your experience: ⭐⭐⭐⭐⭐\n\nThank you for choosing FruitDabba! 🍊`,

  subscription_reminder: (d) =>
    `⏰ Hi ${d.name}! Your FruitDabba subscription expires in 2 days.\n\nRenew now to continue enjoying fresh fruits! Don't miss your daily dose of health.\n\nRenew here: ${process.env.NEXT_PUBLIC_APP_URL}/subscriptions`,
}

export async function POST(req: NextRequest) {
  try {
    const { phone, messageType, orderId, name, total, userId } = await req.json()

    if (!phone || !messageType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const templateFn = MESSAGE_TEMPLATES[messageType]
    if (!templateFn) {
      return NextResponse.json({ error: 'Unknown message type' }, { status: 400 })
    }

    const message = templateFn({ name, orderId, total: String(total) })

    // Format phone (remove +, spaces, dashes)
    const formattedPhone = phone.replace(/[\s\-+]/g, '')

    let responseData: Record<string, unknown> = {}
    let status: 'sent' | 'failed' = 'failed'

    // Send via WhatsApp Business Cloud API
    if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message },
        }),
      })

      responseData = await response.json()
      status = response.ok ? 'sent' : 'failed'
    } else {
      // Dev mode: log the message
      console.log('[WhatsApp Dev]', { phone: formattedPhone, message })
      status = 'sent'
    }

    // Log to Supabase
    const supabase = await createAdminClient()
    await supabase.from('notifications_log').insert({
      user_id: userId || null,
      order_id: orderId || null,
      channel: 'whatsapp',
      message_type: messageType,
      phone: formattedPhone,
      status,
      response_data: responseData,
    })

    return NextResponse.json({ success: status === 'sent', status })
  } catch (err: unknown) {
    console.error('WhatsApp notification error:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
