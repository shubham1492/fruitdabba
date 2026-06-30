'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Gift, ArrowRight } from 'lucide-react'

interface PricingTier {
  label: string
  days: number
  price: number
  badge?: string
  slug: string
}

interface SubscriptionCategory {
  id: string
  emoji: string
  name: string
  tagline: string
  color: string
  bgColor: string
  borderColor: string
  menuItems: string[]
  includes: string[]
  tiers: PricingTier[]
}

const CATEGORIES: SubscriptionCategory[] = [
  {
    id: 'fruit-box',
    emoji: '🍎',
    name: 'Daily Fruit Box',
    tagline: 'Seasonal & exotic fruits curated fresh every day',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    menuItems: [
      'Mon — Seasonal Mix (Mango, Papaya, Banana)',
      'Tue — Citrus Boost (Orange, Kiwi, Pomegranate)',
      'Wed — Berry Day (Strawberry, Grapes, Blueberry)',
      'Thu — Tropical (Pineapple, Dragon Fruit, Guava)',
      'Fri — Power Fruits (Avocado, Pomelo, Custard Apple)',
      'Sat — Surprise Chef\'s Pick',
    ],
    includes: ['5+ Fresh Fruits', 'No Repeats in 26 Days', 'Seasonal & Exotic Mix', 'Free Doorstep Delivery'],
    tiers: [
      { label: '3 Days Trial', days: 3, price: 349, badge: '🎁 Try First', slug: 'fruit-trial-3d' },
      { label: '6 Days Trial', days: 6, price: 699, badge: '✨ Most Popular', slug: 'fruit-trial-6d' },
      { label: 'Monthly Plan', days: 26, price: 4099, badge: '⭐ Best Value', slug: 'medium-pack' },
    ],
  },
  {
    id: 'oat-meal',
    emoji: '🥣',
    name: 'Oat Meal Subscription',
    tagline: 'Nutritious oat meals with fruits & nuts — office & gym ready',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    menuItems: [
      'Mon — Fruit & Nut (Banana, Almond, Honey)',
      'Tue — Peanut Butter Almond Oats',
      'Wed — Berry Oatmeal (Blueberry, Strawberry)',
      'Thu — Crunchy Choco Oats',
      'Fri — Green Apple Cinnamon',
      'Sat — Mango Coconut Oats',
    ],
    includes: ['Freshly Prepared Daily', 'No Preservatives', 'High Fiber & Protein', 'Served Warm or Cold'],
    tiers: [
      { label: '3 Days Trial', days: 3, price: 299, badge: '🎁 Try First', slug: 'oat-trial-3d' },
      { label: '6 Days Trial', days: 6, price: 599, badge: '✨ Popular', slug: 'oat-trial-6d' },
      { label: 'Monthly Plan', days: 26, price: 3699, badge: '⭐ Best Value', slug: 'oat-monthly' },
    ],
  },
  {
    id: 'salad-bowl',
    emoji: '🥗',
    name: 'Fresh Salad Bowl',
    tagline: 'Freshly prepared salads — healthy, filling, zero compromise',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    menuItems: [
      'Mon — Grilled Paneer & Avocado',
      'Tue — Sweet & Spicy Tofu',
      'Wed — Paneer Corn Salad',
      'Thu — Broccoli, Bell Pepper Mix',
      'Fri — Chickpea Quinoa Bowl',
      'Sat — Sautéed Veg Salad',
    ],
    includes: ['1 Salad + 5+ Veggies', 'Hygienically Prepared', 'No Repeats in 26 Days', 'Timely Delivery'],
    tiers: [
      { label: '3 Days Trial', days: 3, price: 349, badge: '🎁 Try First', slug: 'salad-trial-3d' },
      { label: '6 Days Trial', days: 6, price: 699, badge: '✨ Popular', slug: 'salad-trial-6d' },
      { label: 'Monthly Plan', days: 26, price: 3999, badge: '⭐ Best Value', slug: 'corn-chaat-pack' },
    ],
  },
  {
    id: 'juice',
    emoji: '🥤',
    name: 'Juice Subscription',
    tagline: 'Cold-pressed fresh juices — no sugar, no preservatives',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    menuItems: [
      'Mon — Carrot Ginger Immunity Shot',
      'Tue — Watermelon Mint Cooler',
      'Wed — Green Detox (Spinach, Apple, Lemon)',
      'Thu — Orange Turmeric Boost',
      'Fri — Pomegranate Berry Blend',
      'Sat — Mixed Tropical Juice',
    ],
    includes: ['100% Fresh Cold-Pressed', 'No Sugar Added', 'No Preservatives', 'Sealed & Chilled Delivery'],
    tiers: [
      { label: '3 Days Trial', days: 3, price: 349, badge: '🎁 Try First', slug: 'juice-trial-3d' },
      { label: '6 Days Trial', days: 6, price: 699, badge: '✨ Popular', slug: 'juice-trial-6d' },
      { label: 'Monthly Plan', days: 26, price: 3999, badge: '⭐ Best Value', slug: 'juice-monthly' },
    ],
  },
  {
    id: 'protein-bowl',
    emoji: '💪',
    name: 'Protein Gym Bowl',
    tagline: 'High-protein bowls designed for fitness & muscle recovery',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    menuItems: [
      'Mon — Paneer Tikka Bowl + Pomegranate',
      'Tue — Soya & Kiwi Protein Bowl',
      'Wed — Tofu Sprouts Power Bowl',
      'Thu — Paneer & Avocado Fitness Box',
      'Fri — Chickpea & Quinoa Gym Bowl',
      'Sat — Mixed Nuts & Fruit Recovery Bowl',
    ],
    includes: ['25g+ Protein Per Bowl', 'Post-Workout Optimized', 'Fresh Ingredients Daily', 'Macro-Balanced Meals'],
    tiers: [
      { label: '3 Days Trial', days: 3, price: 399, badge: '🎁 Try First', slug: 'protein-trial-3d' },
      { label: '6 Days Trial', days: 6, price: 799, badge: '✨ Popular', slug: 'protein-trial-6d' },
      { label: 'Monthly Plan', days: 26, price: 4499, badge: '⭐ Best Value', slug: 'gym-protein-pack' },
    ],
  },
]

export default function SubscriptionCategoriesSection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('fruit-box')
  const [selectedTiers, setSelectedTiers] = useState<Record<string, number>>({
    'fruit-box': 2,
    'oat-meal': 2,
    'salad-bowl': 2,
    'juice': 2,
    'protein-bowl': 2,
  })

  const selectTier = (catId: string, tierIndex: number) => {
    setSelectedTiers(prev => ({ ...prev, [catId]: tierIndex }))
  }

  return (
    <section id="categories" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-[#fafaf8] relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-4">
            <Gift size={13} /> Choose Your Subscription
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Every Category is a{' '}
            <span className="text-orange">Separate Subscription</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mt-4">
            Subscribe to what you love. Want fruits AND juice? Subscribe to both separately.
            Try before you commit with our 3-day and 6-day trials.
          </p>
        </div>

        {/* Quick-jump category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setExpandedCategory(cat.id)
                setTimeout(() => {
                  document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 50)
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
                expandedCategory === cat.id
                  ? `${cat.borderColor} ${cat.bgColor} ${cat.color} shadow-sm`
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Cards */}
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.id
            const activeTierIdx = selectedTiers[cat.id] ?? 2
            const activeTier = cat.tiers[activeTierIdx]

            return (
              <div
                key={cat.id}
                id={`cat-${cat.id}`}
                className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden bg-white shadow-sm ${
                  isExpanded ? `${cat.borderColor} shadow-lg` : 'border-gray-150 hover:border-gray-300'
                }`}
              >
                {/* Collapsed / Header Row */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between px-6 py-5 cursor-pointer text-left"
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center text-3xl shadow-sm`}>
                      {cat.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{cat.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{cat.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-gray-400 font-semibold">Starting from</div>
                      <div className="text-xl font-extrabold text-gray-900">
                        ₹{cat.tiers[0].price}
                        <span className="text-xs text-gray-400 font-normal ml-1">/ 3 days</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${cat.bgColor} flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cat.color} />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid lg:grid-cols-3 gap-6 mt-6">
                      {/* Left: Sample Menu */}
                      <div className="lg:col-span-1">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Sample Daily Menu</h4>
                        <div className="space-y-2">
                          {cat.menuItems.map((item, i) => (
                            <div key={i} className={`flex items-start gap-2 text-xs py-1.5 px-3 rounded-xl ${cat.bgColor}`}>
                              <span className="font-bold text-gray-400 shrink-0 w-3">{i + 1}</span>
                              <span className="text-gray-700 font-medium">{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What's Included</h4>
                          <div className="space-y-1.5">
                            {cat.includes.map((inc, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                                <Check size={13} className="text-[#22c55e] shrink-0" />
                                {inc}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing Tiers */}
                      <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Choose Your Plan</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          {cat.tiers.map((tier, idx) => {
                            const isActive = activeTierIdx === idx
                            const isMonthly = idx === 2
                            return (
                              <button
                                key={tier.label}
                                onClick={() => selectTier(cat.id, idx)}
                                type="button"
                                className={`relative p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 ${
                                  isActive
                                    ? isMonthly
                                      ? 'border-[#22c55e] bg-[#22c55e]/5 shadow-md ring-4 ring-[#22c55e]/10'
                                      : `${cat.borderColor} ${cat.bgColor} shadow-md`
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                {tier.badge && (
                                  <span className={`absolute -top-2.5 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                    isMonthly ? 'bg-[#22c55e] text-white' : 'bg-gray-800 text-white'
                                  }`}>
                                    {tier.badge}
                                  </span>
                                )}
                                <div className="text-sm font-extrabold text-gray-900 mt-2">{tier.label}</div>
                                <div className={`text-2xl font-extrabold mt-1 ${isMonthly ? 'text-[#22c55e]' : 'text-gray-900'}`}>
                                  ₹{tier.price.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1 font-medium">
                                  {tier.days === 26 ? '26 deliveries / month' : `${tier.days} day delivery`}
                                </div>
                                {tier.days > 0 && (
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    ≈ ₹{Math.round(tier.price / (tier.days === 26 ? 26 : tier.days))}/day
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <Link
                            href={`/checkout?plan=${activeTier.slug}`}
                            className={`inline-flex items-center justify-center gap-2 font-extrabold py-3.5 px-7 rounded-2xl transition-all duration-200 text-sm shadow-sm hover:shadow ${
                              activeTierIdx === 2
                                ? 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
                                : 'bg-gray-900 text-white hover:bg-black'
                            }`}
                          >
                            {activeTierIdx === 2 ? 'Subscribe Now' : `Start ${activeTier.label}`}
                            <ArrowRight size={15} />
                          </Link>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {activeTierIdx < 2
                              ? '✅ No commitment. Try it and then decide.'
                              : '✅ Pause or cancel anytime. Free delivery included.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-10 leading-relaxed">
          💡 You can subscribe to multiple categories independently. For example, subscribe to Daily Fruit Box + Juice Subscription simultaneously.
        </p>
      </div>
    </section>
  )
}
