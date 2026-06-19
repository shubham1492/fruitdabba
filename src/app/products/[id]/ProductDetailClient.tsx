'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  unit: string
  image_url: string | null
  in_stock: boolean
  categories?: { name: string } | null
  nutritional_info?: Record<string, string> | null
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const openAuthModal = useUIStore((state) => state.openAuthModal)
  const supabase = createClient()

  const handleAddToCart = async () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image_url: product.image_url,
      })
    }
    toast.success(`${qty}x ${product.name} added to cart!`)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      openAuthModal()
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-forest">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-forest">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="card overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-cream flex items-center justify-center text-9xl">
                🍎
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categories && (
              <span className="badge-green">{product.categories.name}</span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mt-3">{product.name}</h1>
            <p className="text-gray-500 mt-1">{product.unit}</p>

            <div className="flex items-baseline gap-2 mt-5">
              <span className="text-4xl font-bold text-forest">₹{product.price}</span>
              <span className="text-gray-400">/ {product.unit}</span>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mt-5">{product.description}</p>
            )}

            {/* Qty + Cart */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus size={16} className="text-gray-500" />
                </button>
                <span className="font-bold text-gray-900 w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)}>
                  <Plus size={16} className="text-forest" />
                </button>
              </div>

              <button
                id={`add-to-cart-detail-${product.id}`}
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {['Farm Fresh', 'Free Delivery', 'No Preservatives'].map((h) => (
                <div key={h} className="bg-forest/5 rounded-xl p-3 text-center">
                  <div className="text-xs font-semibold text-forest">{h}</div>
                </div>
              ))}
            </div>

            {/* Nutritional info */}
            {product.nutritional_info && Object.keys(product.nutritional_info).length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-3">Nutritional Info</h3>
                <div className="card p-4 grid grid-cols-3 gap-3">
                  {Object.entries(product.nutritional_info).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="font-bold text-forest text-lg">{val}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-forest transition-colors"
          >
            <ArrowLeft size={16} /> Back to shop
          </button>
        </div>
      </div>
    </div>
  )
}
