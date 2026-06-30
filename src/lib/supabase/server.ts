import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PLANS, MOCK_PROFILES, MOCK_ORDERS, MOCK_REVIEWS } from './mockData'

function getTableData(tableName: string | undefined): any[] {
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
    if (tableName && (global as any)._mockDb[tableName]) {
      return (global as any)._mockDb[tableName]
    }
  }
  return []
}

function applyFilters(data: any[], filters: Record<string, any>): any[] {
  return data.filter((item) =>
    Object.entries(filters).every(([key, val]) => {
      if (key.startsWith('__not_')) {
        const realKey = key.replace('__not_', '')
        return String(item[realKey]) !== String(val)
      }
      if (key === 'status') return String(item.status) === String(val)
      return String(item[key]) === String(val)
    })
  )
}

function createChainableMock(
  tableName?: string,
  filters: Record<string, any> = {},
  opts: { limit?: number; orderBy?: string; ascending?: boolean; head?: boolean; searchField?: string; searchVal?: string } = {}
): any {
  const resolve = () => {
    let data = applyFilters(getTableData(tableName), filters)
    if (opts.searchField && opts.searchVal) {
      const v = opts.searchVal.replace(/%/g, '').toLowerCase()
      data = data.filter((d: any) => String(d[opts.searchField!] || '').toLowerCase().includes(v))
    }
    if (opts.orderBy) {
      data = [...data].sort((a, b) => {
        const av = a[opts.orderBy!], bv = b[opts.orderBy!]
        return (av < bv ? -1 : av > bv ? 1 : 0) * (opts.ascending === false ? -1 : 1)
      })
    }
    if (opts.limit) data = data.slice(0, opts.limit)
    return { data: opts.head ? null : data, error: null, count: data.length }
  }

  const target = { then: (cb: any) => { cb(resolve()); return Promise.resolve(resolve()) } }

  const handler: ProxyHandler<any> = {
    get: (_t, prop) => {
      if (prop === 'then') return target.then
      if (prop === 'single') {
        return async () => {
          const list = applyFilters(getTableData(tableName), filters)
          return { data: list[0] || null, error: null }
        }
      }
      if (prop === 'eq') return (key: string, value: any) =>
        createChainableMock(tableName, { ...filters, [key]: value }, opts)
      if (prop === 'neq') return (key: string, value: any) =>
        createChainableMock(tableName, { ...filters, [`__not_${key}`]: value }, opts)
      if (prop === 'ilike') return (key: string, value: any) =>
        createChainableMock(tableName, filters, { ...opts, searchField: key, searchVal: value })
      if (prop === 'order') return (col: string, { ascending = true }: any = {}) =>
        createChainableMock(tableName, filters, { ...opts, orderBy: col, ascending })
      if (prop === 'limit') return (n: number) =>
        createChainableMock(tableName, filters, { ...opts, limit: n })
      if (prop === 'select') return (_sel: string, selOpts?: any) =>
        createChainableMock(tableName, filters, { ...opts, head: selOpts?.head === true })
      
      if (prop === 'update') return (updateData: any) => {
        return {
          eq: (key: string, value: any) => {
            const db = (global as any)._mockDb || {}
            let count = 0
            if (tableName && db[tableName]) {
              db[tableName] = db[tableName].map((row: any) => {
                const match = Object.entries({ ...filters, [key]: value }).every(([k, v]) => String(row[k]) === String(v))
                if (match) {
                  count++
                  return { ...row, ...updateData }
                }
                return row
              })
            }
            return Promise.resolve({ data: null, error: null, count })
          }
        }
      }

      if (prop === 'delete') return () => {
        return {
          eq: (key: string, value: any) => {
            const db = (global as any)._mockDb || {}
            let count = 0
            if (tableName && db[tableName]) {
              db[tableName] = db[tableName].filter((row: any) => {
                const match = Object.entries({ ...filters, [key]: value }).every(([k, v]) => String(row[k]) === String(v))
                if (match) {
                  count++
                  return false
                }
                return true
              })
            }
            return Promise.resolve({ data: null, error: null, count })
          }
        }
      }

      if (prop === 'insert') return (rows: any) => {
        const db = (global as any)._mockDb || {}
        if (tableName && !db[tableName]) db[tableName] = []

        const dataArray = Array.isArray(rows) ? rows : [rows]
        const insertedRows = dataArray.map((row: any) => {
          const newRow = {
            ...row,
            id: row.id || `mock-${tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: row.created_at || new Date().toISOString()
          }
          if (tableName) {
            db[tableName].push(newRow)
            // Special nesting for orders
            if (tableName === 'order_items') {
              const order = db.orders?.find((o: any) => o.id === newRow.order_id)
              if (order) {
                if (!order.order_items) order.order_items = []
                const exists = order.order_items.some((existing: any) => existing.id === newRow.id)
                if (!exists) order.order_items.push(newRow)
              }
            }
            if (tableName === 'order_tracking') {
              const order = db.orders?.find((o: any) => o.id === newRow.order_id)
              if (order) {
                if (!order.order_tracking) order.order_tracking = []
                const exists = order.order_tracking.some((existing: any) => existing.id === newRow.id)
                if (!exists) order.order_tracking.push(newRow)
              }
            }
          }
          return newRow
        })

        const mockRow = Array.isArray(rows) ? insertedRows : insertedRows[0]

        const insertResult = {
          select: () => ({
            then: (r: any, e?: any) => Promise.resolve({ data: insertedRows, error: null }).then(r, e),
            single: () => Promise.resolve({ data: mockRow, error: null }),
          }),
          single: () => Promise.resolve({ data: mockRow, error: null }),
          then: (r: any, e?: any) => Promise.resolve({ data: insertedRows, error: null }).then(r, e),
        }
        return insertResult
      }
      return () => createChainableMock(tableName, filters, opts)
    }
  }

  return new Proxy(target, handler)
}

function getStubServerClient() {
  return {
    auth: {
      getUser: async () => {
        try {
          const cookieStore = await cookies()
          const mockUserCookie = cookieStore.get('sb-mock-user-token')
          if (mockUserCookie?.value) {
            const user = JSON.parse(decodeURIComponent(mockUserCookie.value))
            return { data: { user }, error: null }
          }
        } catch {}
        return { data: { user: null }, error: null }
      },
      getSession: async () => {
        try {
          const cookieStore = await cookies()
          const mockUserCookie = cookieStore.get('sb-mock-user-token')
          if (mockUserCookie?.value) {
            const user = JSON.parse(decodeURIComponent(mockUserCookie.value))
            return { data: { session: { user, expires_at: 9999999999 } }, error: null }
          }
        } catch {}
        return { data: { session: null }, error: null }
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: new Error('No Supabase URL configured') }),
      signUp: async () => ({ error: new Error('No Supabase URL configured') }),
      signInWithOAuth: async () => ({ error: new Error('No Supabase URL configured') }),
      signOut: async () => ({ error: null }),
      signInWithOtp: async () => ({ data: { message: 'OTP sent' }, error: null }),
      verifyOtp: async () => ({ data: { session: null, user: null }, error: null }),
    },
    from: (tableName: string) => createChainableMock(tableName),
  } as unknown as any
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !url.startsWith('http') || !key) {
    return getStubServerClient()
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !url.startsWith('http') || !key) {
    return getStubServerClient()
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
