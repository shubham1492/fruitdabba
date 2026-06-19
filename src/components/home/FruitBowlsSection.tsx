'use client'

import { Plus, Check, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface FruitBowl {
  id: string
  name: string
  price: number
  description: string
  image: string
  badge?: string
}

const BOWLS: FruitBowl[] = [
  {
    id: 'bowl-mixed',
    name: 'Mixed Fruit Bowl',
    price: 149,
    description: 'A refreshing mix of seasonal favorites like apples, bananas, grapes, and papaya.',
    image: '/images/item-fruit-bowl.png',
    badge: 'Popular'
  },
  {
    id: 'bowl-protein',
    name: 'Protein Fruit Bowl',
    price: 199,
    description: 'Power-packed with bananas, pomegranate, kiwi, almonds, and pumpkin seeds.',
    image: '/images/item-melon-bowl.png',
    badge: 'High Protein'
  },
  {
    id: 'bowl-kids',
    name: 'Kids Fruit Bowl',
    price: 149,
    description: 'Fun, bite-sized sweet fruits like strawberries, grapes, mangoes, and apples.',
    image: '/images/item-berry-smoothie.png',
    badge: 'Kids Special'
  },
  {
    id: 'bowl-detox',
    name: 'Detox Fruit Bowl',
    price: 179,
    description: 'Antioxidant-rich berries, citrus segments, kiwi, and mint leaves.',
    image: '/images/item-green-juice.png',
    badge: 'Detox & Glow'
  },
  {
    id: 'bowl-office',
    name: 'Office Fruit Bowl',
    price: 249,
    description: 'Energy-boosting office desk companion with apples, pears, seedless grapes, and oranges.',
    image: '/images/item-orange-juice.png',
    badge: 'Office Pack'
  }
]

export default function FruitBowlsSection() {
  const [addedBowls, setAddedBowls] = useState<string[]>([])

  // Listen for sync-addon-card events from the builder
  useEffect(() => {
    const handleSyncAddon = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && detail.bowlName) {
        const bowl = BOWLS.find(b => b.name === detail.bowlName)
        if (bowl) {
          if (detail.isAdded) {
            setAddedBowls(prev => prev.includes(bowl.id) ? prev : [...prev, bowl.id])
          } else {
            setAddedBowls(prev => prev.filter(id => id !== bowl.id))
          }
        }
      }
    }
    window.addEventListener('sync-addon-card', handleSyncAddon)
    return () => window.removeEventListener('sync-addon-card', handleSyncAddon)
  }, [])

  const handleAdd = (bowl: FruitBowl) => {
    const isAdded = addedBowls.includes(bowl.id)
    if (isAdded) {
      setAddedBowls(prev => prev.filter(id => id !== bowl.id))
      toast.success(`${bowl.name} removed from your subscription.`)
      // Fire custom event to notify builder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('toggle-subscription-addon', { detail: { bowlName: bowl.name } }))
      }
    } else {
      setAddedBowls(prev => [...prev, bowl.id])
      toast.success(`${bowl.name} added to your subscription! 🎉`)
      // Fire custom event to notify builder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('toggle-subscription-addon', { detail: { bowlName: bowl.name } }))
      }
      
      // Scroll to customize section so they can complete the subscription with the add-on
      setTimeout(() => {
        const customizeSec = document.getElementById('customize')
        if (customizeSec) {
          customizeSec.scrollIntoView({ behavior: 'smooth' })
        }
      }, 800)
    }
  }

  return (
    <section id="bowls" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center mb-16">
          <span className="inline-flex items-center rounded-full bg-[#22c55e]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#22c55e]">
            Premium Add-Ons
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
            Subscription <span className="text-orange">Add-Ons</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mt-2">
            Want pre-sliced convenience? Add these premium fruit bowls to your subscription box for a healthy daily treat.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {BOWLS.map((bowl) => {
            const isAdded = addedBowls.includes(bowl.id)
            return (
              <div key={bowl.id} className="fd-reveal h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <img
                      alt={bowl.name}
                      src={bowl.image}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {bowl.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-orange text-white text-[10px] uppercase font-bold px-2.5 py-1 shadow-sm">
                        {bowl.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {bowl.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-gray-500 flex-1">
                      {bowl.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="font-extrabold text-[#22c55e] text-lg">
                        ₹{bowl.price} <span className="text-[10px] text-gray-400 font-normal">/ bowl</span>
                      </span>
                      
                      <button
                        onClick={() => handleAdd(bowl)}
                        type="button"
                        className={`inline-flex shrink-0 items-center justify-center font-bold px-4 py-2 text-xs gap-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                          isAdded
                            ? 'bg-[#22c55e] text-white shadow-sm'
                            : 'bg-gray-900 text-white hover:bg-black hover:shadow-sm'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="size-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="size-3.5" /> Add to Subscription
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
