'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  unit: string
  image_url: string | null
  description: string | null
  categories?: { name: string; slug: string } | null
}

export default function MenuSection({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState('all')
  const addItem = useCartStore((state) => state.addItem)
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

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'bowls', label: 'Bowls' },
    { id: 'juices', label: 'Juices' },
    { id: 'salads', label: 'Salads' },
    { id: 'smoothies', label: 'Smoothies' },
  ]

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.categories?.slug === activeTab)

  const getBadgeText = (slug: string) => {
    if (slug === 'signature-fruit-bowl') return 'Bestseller'
    if (slug === 'green-detox-juice') return 'Detox'
    if (slug === 'mixed-berry-smoothie') return 'High protein'
    if (slug === 'alphonso-mango-smoothie') return 'Seasonal'
    return null
  }

  return (
    <section id="menu" className="bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Order à la carte
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900">
            Daily Cravings, freshly made
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Not ready for a subscription? Add individual fruit bowls, cold-pressed juices, salads and smoothies to your cart and order in seconds.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10 mt-8 flex flex-wrap justify-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-muted-foreground hover:text-gray-900 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const badge = getBadgeText(product.slug)
            return (
              <div key={product.id} className="fd-reveal">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {product.image_url ? (
                      <img
                        alt={product.name}
                        loading="lazy"
                        src={product.image_url}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-cream">🥣</div>
                    )}
                    {badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-md">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {product.categories?.name || 'Item'}
                    </span>
                    <h3 className="mt-1 font-heading text-lg font-bold leading-tight text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty flex-1">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-1">
                      <span className="font-heading text-xl font-extrabold text-gray-900">
                        ₹{product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        type="button"
                        className="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-primary text-white hover:bg-primary/95 hover:shadow-md cursor-pointer transition-all outline-none font-semibold h-8 px-4 text-xs gap-1.5 rounded-full"
                      >
                        <Plus className="size-4" /> Add
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-400 py-12">No items found in this category.</p>
        )}
      </div>
    </section>
  )
}
