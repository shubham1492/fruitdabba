import { createBrowserClient } from '@supabase/ssr'

import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PLANS, MOCK_PROFILES, MOCK_ORDERS } from './mockData'

function getTableData(tableName: string | undefined): any[] {
  switch (tableName) {
    case 'products': return MOCK_PRODUCTS
    case 'categories': return MOCK_CATEGORIES
    case 'subscription_plans': return MOCK_PLANS
    case 'profiles': return MOCK_PROFILES
    case 'orders': return MOCK_ORDERS
    default: return []
  }
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
  const resolve = async () => {
    let data: any[] = []
    if (tableName) {
      try {
        const res = await fetch(`/api/mock-db?table=${tableName}`)
        const json = await res.json()
        data = json.data || []
      } catch {
        data = getTableData(tableName)
      }
    }

    data = applyFilters(data, filters)
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

  const target = {
    then: (cb: any) => {
      return resolve().then((res) => {
        if (cb) cb(res)
        return res
      })
    }
  }

  const handler: ProxyHandler<any> = {
    get: (_t, prop) => {
      if (prop === 'then') return target.then
      if (prop === 'single') {
        return async () => {
          const res = await resolve()
          return { data: res.data?.[0] || null, error: null }
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
            const updatePromise = (async () => {
              try {
                const res = await fetch('/api/mock-db', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update', table: tableName, data: updateData, filters: { ...filters, [key]: value } })
                })
                const json = await res.json()
                return { data: null, error: json.error, count: json.count }
              } catch (err: any) {
                return { data: null, error: null }
              }
            })()
            return {
              then: (cb: any) => updatePromise.then(cb)
            }
          }
        }
      }

      if (prop === 'delete') return () => {
        return {
          eq: (key: string, value: any) => {
            const deletePromise = (async () => {
              try {
                const res = await fetch('/api/mock-db', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'delete', table: tableName, filters: { ...filters, [key]: value } })
                })
                const json = await res.json()
                return { data: null, error: json.error, count: json.count }
              } catch (err: any) {
                return { data: null, error: null }
              }
            })()
            return {
              then: (cb: any) => deletePromise.then(cb)
            }
          }
        }
      }

      if (prop === 'insert') return (rows: any) => {
        const insertPromise = (async () => {
          try {
            const res = await fetch('/api/mock-db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'insert', table: tableName, data: rows })
            })
            const json = await res.json()
            return { data: json.data, error: json.error }
          } catch (err: any) {
            const mockRow = Array.isArray(rows)
              ? { ...rows[0], id: `mock-${tableName}-${Date.now()}` }
              : { ...rows, id: `mock-${tableName}-${Date.now()}` }
            return { data: mockRow, error: null }
          }
        })()

        const insertProxy: any = {
          select: () => ({
            single: async () => {
              const res = await insertPromise
              return { data: Array.isArray(res.data) ? res.data[0] : res.data, error: res.error }
            },
            then: (cb: any) => insertPromise.then((res) => cb({ data: Array.isArray(res.data) ? res.data : [res.data], error: res.error })),
          }),
          then: (cb: any) => insertPromise.then((res) => cb({ data: Array.isArray(res.data) ? res.data : [res.data], error: res.error })),
          single: async () => {
            const res = await insertPromise
            return { data: Array.isArray(res.data) ? res.data[0] : res.data, error: res.error }
          },
        }
        return insertProxy
      }

      return () => createChainableMock(tableName, filters, opts)
    }
  }

  return new Proxy(target, handler)
}

const mockAuthListeners = new Set<(event: string, session: any) => void>()

function getMockUserFromCookie() {
  if (typeof window === 'undefined') return null
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith('sb-mock-user-token='))
    ?.split('=')[1]
  if (cookieValue) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue))
    } catch {}
  }
  return null
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !url.startsWith('http') || !key) {
    // Return a mock auth stub during build/SSR or local testing without credentials
    return {
      auth: {
        getUser: async () => {
          const user = getMockUserFromCookie()
          return { data: { user }, error: null }
        },
        getSession: async () => {
          const user = getMockUserFromCookie()
          return { data: { session: user ? { user, expires_at: 9999999999 } : null }, error: null }
        },
        onAuthStateChange: (callback: any) => {
          mockAuthListeners.add(callback)
          const user = getMockUserFromCookie()
          // Call immediately on registration
          callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user, expires_at: 9999999999 } : null)
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  mockAuthListeners.delete(callback)
                }
              }
            }
          }
        },
        signInWithPassword: async ({ email, password }: any) => {
          const mockUser = {
            id: 'mock-uuid-1234-5678',
            email: email || 'user@example.com',
            user_metadata: {
              full_name: email ? email.split('@')[0] : 'User',
            }
          }
          document.cookie = `sb-mock-user-token=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=31536000`
          mockAuthListeners.forEach((l) => l('SIGNED_IN', { user: mockUser, expires_at: 9999999999 }))
          return { data: { user: mockUser }, error: null }
        },
        signUp: async ({ email, password, options }: any) => {
          const mockUser = {
            id: 'mock-uuid-1234-5678',
            email: email || 'user@example.com',
            user_metadata: {
              full_name: options?.data?.full_name || (email ? email.split('@')[0] : 'User'),
            }
          }
          document.cookie = `sb-mock-user-token=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=31536000`
          mockAuthListeners.forEach((l) => l('SIGNED_IN', { user: mockUser, expires_at: 9999999999 }))
          return { data: { user: mockUser }, error: null }
        },
        signInWithOAuth: async (params: any) => {
          const provider = params?.provider || 'google'
          const options = params?.options || {}
          
          if (provider === 'google') {
            const mockUser = {
              id: 'mock-uuid-1234-5678',
              email: 'rahul.sharma@gmail.com',
              user_metadata: {
                full_name: 'Rahul Sharma',
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
              }
            }
            document.cookie = `sb-mock-user-token=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=31536000`
            mockAuthListeners.forEach((l) => l('SIGNED_IN', { user: mockUser, expires_at: 9999999999 }))
            
            const next = options?.redirectTo || window.location.origin
            setTimeout(() => {
              window.location.href = next
            }, 300)
            return { data: { provider: 'google', url: next }, error: null }
          }
          return { error: new Error('Unsupported provider in Mock mode') }
        },
        signOut: async () => {
          document.cookie = 'sb-mock-user-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          mockAuthListeners.forEach((l) => l('SIGNED_OUT', null))
          return { error: null }
        },
      },
      from: (tableName: string) => createChainableMock(tableName),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}
