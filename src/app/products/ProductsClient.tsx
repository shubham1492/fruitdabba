'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, ShoppingBag, LayoutGrid, LayoutList } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  unit: string
  image_url: string | null
  in_stock: boolean
  description: string | null
  categories?: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  products: Product[]
  categories: Category[]
  activeCategory?: string
  initialSearch?: string
}

export default function ProductsClient({ products, categories, activeCategory, initialSearch }: Props) {
  const [search, setSearch] = useState(initialSearch || '')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)

  const handleCategoryClick = (slug?: string) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (search) params.set('search', search)
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (search) params.set('search', search)
    router.push(`/products?${params.toString()}`)
  }

  const openAuthModal = useUIStore((state) => state.openAuthModal)
  const supabase = createClient()

  const handleAddToCart = async (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url,
    })
    toast.success(`${product.name} added to cart!`)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      openAuthModal()
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-cream pt-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Fresh Fruit Shop 🍎</h1>
          <p className="text-gray-500 mt-2">
            {products.length} fresh products available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card p-6 sticky top-28">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-forest" />
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryClick()}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      !activeCategory
                        ? 'bg-forest text-white'
                        : 'text-gray-600 hover:bg-cream hover:text-forest'
                    }`}
                  >
                    All Fruits
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === cat.slug
                          ? 'bg-forest text-white'
                          : 'text-gray-600 hover:bg-cream hover:text-forest'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fruits..."
                  className="input pl-11"
                />
              </form>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-auto"
              >
                <option value="name">Sort: A-Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-forest text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-forest text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <LayoutList size={18} />
                </button>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-700 text-xl">No fruits found</h3>
                <p className="text-gray-400 mt-2">Try a different search or category</p>
              </div>
            ) : (
              <div className={
                view === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-4'
              }>
                {sortedProducts.map((product) => (
                  view === 'grid' ? (
                    <div key={product.id} className="group card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-44 bg-cream overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🍎</div>
                        )}
                        {product.categories && (
                          <span className="absolute top-2 left-2 badge-green text-xs">{product.categories.name}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <Link href={`/products/${product.id}`} className="font-bold text-gray-900 hover:text-forest transition-colors text-sm">
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-forest">₹{product.price}</span>
                          <button
                            id={`add-cart-${product.id}`}
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-1 bg-forest text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-forest-light transition-colors"
                          >
                            <ShoppingBag size={12} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={product.id} className="card flex gap-5 p-5 hover:shadow-card-hover transition-all">
                      <div className="w-24 h-24 bg-cream rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-3xl">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : '🍎'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/products/${product.id}`} className="font-bold text-gray-900 hover:text-forest transition-colors">
                              {product.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="text-xl font-bold text-forest">₹{product.price}</div>
                            <div className="text-xs text-gray-400">/ {product.unit}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="mt-3 flex items-center gap-2 bg-forest text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-light transition-colors"
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
