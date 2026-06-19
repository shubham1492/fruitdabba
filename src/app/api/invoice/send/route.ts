import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

const ADMIN_EMAIL = 'shubhamjain.acts@gmail.com'

function generateInvoiceHTML(order: any, invoiceNumber: string, gst: number, userEmail: string) {
  const subtotal = Number(order.subtotal)
  const delivery = Number(order.delivery_fee)
  const total = subtotal + delivery + gst
  const planName = order.subscription_plan_name || order.order_items?.[0]?.product_name || 'Fruit Subscription'
  const timeSlot = order.preferences?.timeSlot || '8 – 10 AM'
  const paymentMethod = (order.payment_method || order.preferences?.paymentMethod || 'UPI').toUpperCase()
  const customerName = order.customer_name || order.shipping_address?.name || 'Valued Customer'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber} | FruitDabba</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
    .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .top-bar { background: #22c55e; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
    .brand { color: white; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
    .email-notice { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; padding: 8px 20px; margin: 20px 32px; font-size: 13px; color: #15803d; text-align: center; }
    .invoice-body { padding: 32px; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; }
    .company-name { font-size: 22px; font-weight: 900; margin-bottom: 8px; }
    .green { color: #22c55e; }
    .company-info { font-size: 11px; color: #9ca3af; line-height: 1.7; }
    .invoice-label { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #111827; margin-bottom: 4px; }
    .invoice-number { font-size: 14px; font-weight: 700; color: #374151; }
    .invoice-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .paid-badge { display: inline-block; margin-top: 8px; background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; font-size: 10px; font-weight: 900; letter-spacing: 1px; padding: 3px 10px; border-radius: 20px; }
    .billing-row { display: flex; gap: 32px; background: #f9fafb; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
    .billing-col { flex: 1; }
    .billing-label { font-size: 9px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
    .billing-name { font-size: 14px; font-weight: 700; color: #111827; }
    .billing-detail { font-size: 12px; color: #6b7280; margin-top: 2px; line-height: 1.6; }
    .items-header { display: flex; justify-content: space-between; font-size: 9px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; margin-bottom: 12px; }
    .line-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .line-item-name { font-size: 14px; font-weight: 700; color: #111827; }
    .line-item-desc { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .line-item-amount { font-size: 14px; font-weight: 700; color: #111827; white-space: nowrap; }
    .subtotal-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; color: #6b7280; }
    .total-row { display: flex; justify-content: space-between; padding: 16px 0; font-size: 16px; font-weight: 900; color: #111827; border-top: 2px solid #111827; margin-top: 8px; }
    .total-amount { color: #22c55e; font-size: 20px; }
    .footer-note { background: #f9fafb; border-radius: 12px; padding: 16px 20px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.7; }
    .action-row { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; }
    .btn { display: inline-block; background: #22c55e; color: white; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 24px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    

    <div class="invoice-body">
      <div class="invoice-header">
        <div>
          <div class="company-name">Fruit<span class="green">Dabba</span></div>
          <div class="company-info">
            FruitDabba Pvt. Ltd.<br/>
            Koramangala, Bangalore 560034<br/>
            care@fruitdabba.in · +91 75981 66088
          </div>
        </div>
        <div style="text-align:right;">
          <div class="invoice-label">INVOICE</div>
          <div class="invoice-number">${invoiceNumber}</div>
          <div class="invoice-date">${format(new Date(order.created_at), 'dd MMM yyyy')}</div>
          <span class="paid-badge">PAID</span>
        </div>
      </div>

      <div class="billing-row">
        <div class="billing-col">
          <div class="billing-label">Billed To</div>
          <div class="billing-name">${customerName}</div>
          <div class="billing-detail">${userEmail}</div>
          ${order.shipping_address ? `<div class="billing-detail">${order.shipping_address.line1}${order.shipping_address.line2 ? ', ' + order.shipping_address.line2 : ''}<br/>${order.shipping_address.city} ${order.shipping_address.pincode}</div>` : ''}
        </div>
        <div class="billing-col">
          <div class="billing-label">Delivery</div>
          <div class="billing-detail">Delivered every day · ${timeSlot}</div>
          <div class="billing-detail">Payment: ${paymentMethod}</div>
          ${order.preferences?.startDate ? `<div class="billing-detail">Starts: ${format(new Date(order.preferences.startDate), 'dd MMM yyyy')}</div>` : ''}
        </div>
      </div>

      <div class="items-header">
        <span>Description</span><span>Amount</span>
      </div>

      <div class="line-item">
        <div>
          <div class="line-item-name">${planName}</div>
          ${order.preferences?.likes?.length > 0 ? `<div class="line-item-desc">${order.preferences.likes.join(', ')}</div>` : ''}
        </div>
        <div class="line-item-amount">₹${subtotal.toLocaleString()}</div>
      </div>

      <div class="subtotal-row">
        <span>Delivery</span>
        <span style="color:${delivery === 0 ? '#22c55e' : '#111827'};font-weight:${delivery === 0 ? '700' : '400'}">${delivery === 0 ? 'Free' : '₹' + delivery}</span>
      </div>

      <div class="subtotal-row">
        <span>GST (5%)</span>
        <span>₹${gst}</span>
      </div>

      <div class="total-row">
        <span>Total paid</span>
        <span class="total-amount">₹${total.toLocaleString()}</span>
      </div>

      <div class="footer-note">
        Thank you for subscribing to FruitDabba — fresh, handpicked fruit, delivered on schedule.<br/>
        This is a computer-generated invoice.
      </div>
    </div>

    <div class="action-row">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invoice/${order.id}" class="btn">
        View & Download Invoice
      </a>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const invoiceNumber = `FD-${format(new Date(order.created_at), 'yyyyMMdd')}-${orderId.slice(0, 4).toUpperCase()}`
    const gst = Math.round(Number(order.subtotal) * 0.05)
    const customerEmail = email || order.customer_email || ''
    const html = generateInvoiceHTML(order, invoiceNumber, gst, customerEmail)

    // Try sending via Resend if API key is set
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && resendKey !== 'your_resend_api_key') {
      const recipients = [customerEmail, ADMIN_EMAIL].filter(Boolean)
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FruitDabba <invoices@fruitdabba.in>',
          to: recipients,
          subject: `Your FruitDabba Invoice ${invoiceNumber}`,
          html,
        }),
      })

      if (!emailRes.ok) {
        const errText = await emailRes.text()
        console.error('Resend error:', errText)
        // Don't throw — still return success so order flow isn't broken
      }
    } else {
      // No email provider configured — log for dev
      console.log(`📧 [DEV] Would send invoice ${invoiceNumber} to: ${customerEmail}, BCC: ${ADMIN_EMAIL}`)
      console.log(`📧 Invoice HTML preview: ${html.slice(0, 200)}...`)
    }

    return NextResponse.json({ success: true, invoiceNumber })
  } catch (err: any) {
    console.error('Invoice send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
