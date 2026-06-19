'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  unit: string
  image_url: string | null
  is_featured: boolean
  in_stock: boolean
  categories?: { name: string; slug: string } | null
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const openAuthModal = useUIStore((state) => state.openAuthModal)
  const supabase = createClient()

  const handleAddToCart = async () => {
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

  return (
    <div className="group card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-cream overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
            🍎
          </div>
        )}
        {/* Category badge */}
        {product.categories && (
          <span className="absolute top-3 left-3 badge-green text-xs">
            {product.categories.name}
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 hover:text-forest transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xl font-bold text-forest">₹{product.price}</span>
            <span className="text-gray-400 text-xs ml-1">/ {product.unit}</span>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className="flex items-center gap-1.5 bg-forest text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-forest-light transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-sm font-bold text-orange uppercase tracking-widest">Fresh Picks</span>
            <h2 className="section-heading mt-3">
              Bestselling <span className="text-forest">Fruits</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-forest font-semibold hover:text-forest-light transition-colors mt-4 md:mt-0"
          >
            View all fruits <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Seeded products note */}
        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🛒</div>
            <p>No featured products yet. <Link href="/admin/products" className="text-forest underline">Add products</Link> to get started.</p>
          </div>
        )}
      </div>
    </section>
  )
}
