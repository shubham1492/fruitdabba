export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics — Admin' }

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: orders },
    { data: topProducts },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, status, created_at')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: true }),
    supabase
      .from('order_items')
      .select('product_name, quantity, total_price')
      .order('total_price', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (orders as any[])?.reduce((s: number, o: any) => s + Number(o.total), 0) || 0
  const totalOrders = orders?.length || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Revenue by status
  const deliveredRevenue = (orders as any[])?.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total), 0) || 0

  // Group by month
  const monthlyRevenue: Record<string, number> = {};
  (orders as any[])?.forEach((o: any) => {
    const month = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(o.total)
  })
  const maxMonth = Math.max(...Object.values(monthlyRevenue), 1)


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Revenue & order insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'Paid orders' },
          { label: 'Total Orders', value: String(totalOrders), sub: 'Completed payments' },
          { label: 'Avg. Order Value', value: `₹${avgOrderValue.toFixed(0)}`, sub: 'Per order' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart (simple bar chart) */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-6">Monthly Revenue</h2>
        {Object.keys(monthlyRevenue).length === 0 ? (
          <p className="text-center text-gray-400 py-12">No revenue data yet</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {Object.entries(monthlyRevenue).map(([month, rev]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-forest">₹{(rev / 1000).toFixed(1)}K</div>
                <div
                  className="w-full bg-gradient-to-t from-forest to-forest-light rounded-t-lg transition-all"
                  style={{ height: `${(rev / maxMonth) * 140}px`, minHeight: '4px' }}
                />
                <div className="text-xs text-gray-400">{month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-6">Top Selling Products</h2>
        <div className="space-y-4">
          {(topProducts as any[])?.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-forest/10 rounded-xl flex items-center justify-center text-sm font-bold text-forest">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{p.product_name}</div>
                <div className="text-xs text-gray-400">{p.quantity} units sold</div>
              </div>
              <div className="font-bold text-forest">₹{p.total_price}</div>
            </div>
          ))}
          {(!topProducts || topProducts.length === 0) && (
            <p className="text-center text-gray-400 py-8">No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
