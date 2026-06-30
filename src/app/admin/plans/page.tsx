'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  duration_days: number
  plan_type: string
  features: string[] | any
  is_popular: boolean
}

const supabase = createClient()

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .order('price')

    if (search) query = query.ilike('name', `%${search}%`)

    const { data } = await query
    setPlans((data || []) as SubscriptionPlan[])
    setLoading(false)
  }, [search])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const togglePopular = async (id: string, val: boolean) => {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_popular: !val })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      fetchPlans()
      toast.success('Popular status updated')
    }
  }

  const deletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return
    setDeleting(id)
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete plan. It might be referenced by active customer subscriptions.')
    } else {
      toast.success('Subscription plan deleted!')
      fetchPlans()
    }
    setDeleting(null)
  }

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'fruits': return '🍎 Daily Fruits'
      case 'salads': return '🥗 Salads & Gym'
      case 'custom': return '⚙️ Custom Box'
      default: return '📦 Subscription'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 text-sm">{plans.length} plans available in UI</p>
        </div>
        <Link
          href="/admin/plans/new"
          id="add-plan-btn"
          className="flex items-center gap-2 bg-forest text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors"
        >
          <Plus size={16} /> Add Subscription Plan
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plans by name..."
          className="input pl-10 max-w-md text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Plan Name</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Type / Tab</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Price (₹)</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Duration (Days)</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Features Count</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Best Value / Popular</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-forest" />
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No subscription plans found
                </td>
              </tr>
            ) : (
              plans.map((p) => {
                const featureList = Array.isArray(p.features) ? p.features : []
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400 max-w-xs truncate">{p.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 ${
                        p.plan_type === 'fruits' ? 'bg-orange/10 text-orange' :
                        p.plan_type === 'salads' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getPlanTypeLabel(p.plan_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-forest">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {p.duration_days} days
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {featureList.length} checklist items
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePopular(p.id, p.is_popular)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          p.is_popular
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-55'
                        }`}
                      >
                        <Star size={12} fill={p.is_popular ? 'white' : 'transparent'} />
                        {p.is_popular ? 'Featured' : 'Mark Popular'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/plans/${p.id}/edit`} className="text-gray-400 hover:text-forest transition-colors">
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => deletePlan(p.id)}
                          disabled={deleting === p.id}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {deleting === p.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
