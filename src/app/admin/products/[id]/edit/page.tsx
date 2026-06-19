'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: '1 kg',
    image_url: '',
    category_id: '',
    in_stock: true,
    is_featured: false,
  })

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (catError) throw catError
        setCategories(catData || [])

        // Fetch product details
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (prodError) throw prodError
        if (prodData) {
          setForm({
            name: prodData.name || '',
            description: prodData.description || '',
            price: prodData.price?.toString() || '',
            unit: prodData.unit || '1 kg',
            image_url: prodData.image_url || '',
            category_id: prodData.category_id || '',
            in_stock: prodData.in_stock ?? true,
            is_featured: prodData.is_featured ?? false,
          })
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load product details')
        router.push('/admin/products')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, supabase, router])

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name,
          slug: slugify(form.name),
          description: form.description || null,
          price: parseFloat(form.price),
          unit: form.unit,
          image_url: form.image_url || null,
          category_id: form.category_id || null,
          in_stock: form.in_stock,
          is_featured: form.is_featured,
        })
        .eq('id', id)
      if (error) throw error
      toast.success('Product updated!')
      router.push('/admin/products')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string | boolean) =>
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
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-forest mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} required className="input" placeholder="e.g. Alphonso Mango" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="input resize-none" placeholder="Describe the fruit..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} required min="0" step="0.01" className="input" placeholder="299" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
              <input value={form.unit} onChange={(e) => update('unit', e.target.value)} className="input" placeholder="1 kg" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
              <input value={form.image_url} onChange={(e) => update('image_url', e.target.value)} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="input">
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => update('in_stock', !form.in_stock)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.in_stock ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.in_stock ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => update('is_featured', !form.is_featured)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_featured ? 'bg-orange' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} id="save-product-btn" className="btn-primary flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
            <Link href="/admin/products" className="btn-outline">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
