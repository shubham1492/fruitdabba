'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [featureInput, setFeatureInput] = useState('')
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    discount_pct: '0',
    delivery_frequency: 'daily',
    plan_type: 'fruits',
    is_popular: false,
    features: [] as string[],
  })

  useEffect(() => {
    async function loadPlan() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        if (data) {
          setForm({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            duration_days: data.duration_days?.toString() || '30',
            discount_pct: data.discount_pct?.toString() || '0',
            delivery_frequency: data.delivery_frequency || 'daily',
            plan_type: data.plan_type || 'fruits',
            is_popular: data.is_popular ?? false,
            features: Array.isArray(data.features) ? (data.features as string[]) : [],
          })
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load subscription plan details')
        router.push('/admin/plans')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      loadPlan()
    }
  }, [id, router])

  const slugify = (text: string) =>
    text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const addFeature = () => {
    if (!featureInput.trim()) return
    setForm(f => ({
      ...f,
      features: [...f.features, featureInput.trim()]
    }))
    setFeatureInput('')
  }

  const removeFeature = (index: number) => {
    setForm(f => ({
      ...f,
      features: f.features.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Plan Name is required')
    if (!form.price) return toast.error('Price is required')
    if (form.features.length === 0) return toast.error('Please add at least one feature or description bullet point')

    setLoading(true)
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: form.name,
          slug: slugify(form.name),
          description: form.description || null,
          price: parseFloat(form.price),
          duration_days: parseInt(form.duration_days) || 30,
          discount_pct: parseFloat(form.discount_pct) || 0,
          delivery_frequency: form.delivery_frequency as any,
          plan_type: form.plan_type,
          is_popular: form.is_popular,
          features: form.features,
        })
        .eq('id', id)

      if (error) throw error
      toast.success('Subscription plan updated successfully!')
      router.push('/admin/plans')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subscription plan')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }))

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-forest" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/plans" className="flex items-center gap-2 text-gray-500 hover:text-forest mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Plans
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Subscription Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Name *</label>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                className="input text-sm"
                placeholder="e.g. Basic Pack, Wellness Salad Dabba"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description * (displays as subtitle in card)</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={2}
                required
                className="input resize-none text-sm"
                placeholder="e.g. Weight: 300-350 gms. Minimum 4-5 fruits per day."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                required
                min="0"
                step="0.01"
                className="input text-sm"
                placeholder="3060"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (Days) *</label>
              <input
                type="number"
                value={form.duration_days}
                onChange={(e) => update('duration_days', e.target.value)}
                required
                min="1"
                className="input text-sm"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Type / Display Tab *</label>
              <select
                value={form.plan_type}
                onChange={(e) => update('plan_type', e.target.value)}
                className="input text-sm"
              >
                <option value="fruits">🍎 Daily Fruit Packs Tab</option>
                <option value="salads">🥗 Wellness Salads & Gym Tab</option>
                <option value="custom">⚙️ Custom Box Builder Tab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Frequency *</label>
              <select
                value={form.delivery_frequency}
                onChange={(e) => update('delivery_frequency', e.target.value)}
                className="input text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Percentage (%)</label>
              <input
                type="number"
                value={form.discount_pct}
                onChange={(e) => update('discount_pct', e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="input text-sm"
                placeholder="0"
              />
            </div>

            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => update('is_popular', !form.is_popular)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_popular ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_popular ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Best Value / Featured Badge</span>
              </label>
            </div>
          </div>

          {/* Features bullet list */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Bullet Points / Features List *</h3>
            <div className="flex gap-2 mb-4">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add feature e.g., Weight: 300-350 gms, Free doorstep delivery"
                className="input text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-forest text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-forest-light transition-colors flex items-center gap-1.5"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {form.features.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No features added. Add at least one bullet point.</p>
            ) : (
              <div className="space-y-2 max-w-xl">
                {form.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-cream px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-700 font-semibold">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} id="save-plan-btn" className="btn-primary flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
            <Link href="/admin/plans" className="btn-outline">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
