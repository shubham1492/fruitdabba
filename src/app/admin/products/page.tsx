'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  unit: string
  in_stock: boolean
  is_featured: boolean
  image_url: string | null
  categories?: { name: string } | null
}

// Stable singleton – avoids re-render loop
const supabase = createClient()

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .order('name')

    if (search) query = query.ilike('name', `%${search}%`)

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleStock = async (id: string, val: boolean) => {
    await supabase.from('products').update({ in_stock: !val }).eq('id', id)
    fetchProducts()
    toast.success('Stock status updated')
  }

  const toggleFeatured = async (id: string, val: boolean) => {
    await supabase.from('products').update({ is_featured: !val }).eq('id', id)
    fetchProducts()
    toast.success('Featured status updated')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else { toast.success('Product deleted'); fetchProducts() }
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products</p>
        </div>
        <Link href="/admin/products/new" id="add-product-btn" className="flex items-center gap-2 bg-forest text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-light transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-10 max-w-md"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Product</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Price</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">In Stock</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Featured</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-forest" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-lg overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : '🍎'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.unit}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.categories?.name || '—'}</td>
                <td className="px-6 py-4 text-sm font-bold text-forest">₹{p.price}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${p.in_stock ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.in_stock ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleFeatured(p.id, p.is_featured)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${p.is_featured ? 'bg-orange' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.is_featured ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-gray-400 hover:text-forest transition-colors">
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      disabled={deleting === p.id}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {deleting === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
