import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PLANS, MOCK_PROFILES, MOCK_ORDERS, MOCK_REVIEWS } from '@/lib/supabase/mockData'

function initMockDb() {
  if (typeof global !== 'undefined') {
    if (!(global as any)._mockDb) {
      (global as any)._mockDb = {
        products: JSON.parse(JSON.stringify(MOCK_PRODUCTS)),
        categories: JSON.parse(JSON.stringify(MOCK_CATEGORIES)),
        subscription_plans: JSON.parse(JSON.stringify(MOCK_PLANS)),
        profiles: JSON.parse(JSON.stringify(MOCK_PROFILES)),
        orders: JSON.parse(JSON.stringify(MOCK_ORDERS)),
        reviews: JSON.parse(JSON.stringify(MOCK_REVIEWS)),
        addresses: [],
        subscriptions: [],
        order_items: [],
        order_tracking: [],
        notifications_log: []
      }
    }
    return (global as any)._mockDb
  }
  return null
}

export async function GET(req: NextRequest) {
  const reset = req.nextUrl.searchParams.get('reset')
  if (reset === 'true' && typeof global !== 'undefined') {
    (global as any)._mockDb = null
  }
  const db = initMockDb()
  const table = req.nextUrl.searchParams.get('table')
  if (reset === 'true') {
    return NextResponse.json({ success: true, message: 'Mock DB reset successfully' })
  }
  if (!db || !table) {
    return NextResponse.json({ data: [], error: 'Table or DB not found' })
  }
  return NextResponse.json({ data: db[table] || [], error: null })
}

export async function POST(req: NextRequest) {
  const db = initMockDb()
  if (!db) return NextResponse.json({ error: 'DB not initialized' }, { status: 500 })

  const { action, table, data, filters } = await req.json()

  if (!db[table]) db[table] = []

  if (action === 'insert') {
    const rows = Array.isArray(data) ? data : [data]
    const insertedRows = rows.map((row: any) => {
      const newRow = {
        ...row,
        id: row.id || `mock-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: row.created_at || new Date().toISOString()
      }
      db[table].push(newRow)
      return newRow
    })

    // Special handling: if inserting order_items, order_tracking, etc., nest them inside the corresponding order in orders table too!
    if (table === 'order_items') {
      insertedRows.forEach((item: any) => {
        const order = db.orders.find((o: any) => o.id === item.order_id)
        if (order) {
          if (!order.order_items) order.order_items = []
          const exists = order.order_items.some((existing: any) => existing.id === item.id)
          if (!exists) order.order_items.push(item)
        }
      })
    }
    if (table === 'order_tracking') {
      insertedRows.forEach((track: any) => {
        const order = db.orders.find((o: any) => o.id === track.order_id)
        if (order) {
          if (!order.order_tracking) order.order_tracking = []
          const exists = order.order_tracking.some((existing: any) => existing.id === track.id)
          if (!exists) order.order_tracking.push(track)
        }
      })
    }

    return NextResponse.json({ data: Array.isArray(data) ? insertedRows : insertedRows[0], error: null })
  }

  if (action === 'update') {
    let count = 0
    db[table] = db[table].map((row: any) => {
      const match = Object.entries(filters || {}).every(([k, v]) => String(row[k]) === String(v))
      if (match) {
        count++
        return { ...row, ...data }
      }
      return row
    })
    return NextResponse.json({ data: null, error: null, count })
  }

  if (action === 'delete') {
    let count = 0
    db[table] = db[table].filter((row: any) => {
      const match = Object.entries(filters || {}).every(([k, v]) => String(row[k]) === String(v))
      if (match) {
        count++
        return false
      }
      return true
    })
    return NextResponse.json({ data: null, error: null, count })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
