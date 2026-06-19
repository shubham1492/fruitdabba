'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Star, Sparkles, ChevronRight } from 'lucide-react'
import type { SubscriptionPlan } from '@/lib/types/database'

export default function SubscriptionCTA({ plans }: { plans: SubscriptionPlan[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'fruits' | 'salads' | 'custom'>('fruits')

  const fruitPlans = plans.filter(p => ['basic-pack', 'mini-pack', 'medium-pack', 'premium-pack'].includes(p.slug))
  const saladPlans = plans.filter(p => ['gym-protein-pack', 'corn-chaat-pack'].includes(p.slug))
  const customPlans = plans.filter(p => ['custom-pack'].includes(p.slug))

  // Set beautiful icons/emoji based on plan type
  const getPlanEmoji = (slug: string) => {
    switch (slug) {
      case 'basic-pack': return '🍎'
      case 'mini-pack': return '🍉'
      case 'medium-pack': return '🌱'
      case 'premium-pack': return '🥜'
      case 'gym-protein-pack': return '💪'
      case 'corn-chaat-pack': return '🌽'
      case 'custom-pack': return '🎁'
      default: return '📦'
    }
  }

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const features = Array.isArray(plan.features) ? plan.features as string[] : []
    const planEmoji = getPlanEmoji(plan.slug)
    const isCustom = plan.slug === 'custom-pack'
    const actionLink = isCustom ? '#customize' : `/checkout?plan=${plan.slug}`
    const actionLabel = isCustom ? 'Open Box Builder' : 'Subscribe Now'

    return (
      <div
        key={plan.id}
        className={`relative card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover flex flex-col h-full bg-white border ${
          plan.is_popular
            ? 'border-2 border-[#22c55e] shadow-lg !overflow-visible ring-4 ring-[#22c55e]/15'
            : 'border-gray-250 hover:border-gray-300'
        }`}
      >
        {plan.is_popular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
            <span className="bg-[#22c55e] text-white text-[10px] tracking-wider uppercase font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
              <Star size={10} fill="white" /> Best Value Pack
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                <span className="text-xl">{planEmoji}</span>
                {plan.name}
              </h3>
              {plan.slug === 'premium-pack' && (
                <span className="bg-orange-100 text-orange text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Elite
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 min-h-[36px] leading-relaxed">
              {plan.description}
            </p>
          </div>

          <div className="mb-5 bg-gray-50 p-4.5 rounded-2xl border border-gray-100">
            <div className="flex items-baseline gap-1">
              <span className="text-3.5xl font-extrabold text-gray-900">
                ₹{plan.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {isCustom ? '/ base 26 days' : '/ 26 days'}
              </span>
            </div>
            <div className="text-[11px] mt-2 text-forest font-bold flex items-center gap-1">
              <span>🗓️</span> 26 Daily Deliveries (Sun Holiday)
            </div>
            <div className="text-[10px] text-gray-400 mt-1 font-semibold">
              If not delivered, it will be carried forward
            </div>
          </div>

          <ul className="space-y-2.5 mb-6 flex-grow">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <Check size={14} className="mt-0.5 shrink-0 text-[#22c55e]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {isCustom ? (
          <a
            href={actionLink}
            onClick={(e) => {
              e.preventDefault()
              const customSec = document.getElementById('customize')
              if (customSec) {
                customSec.scrollIntoView({ behavior: 'smooth' })
              } else {
                router.push('/#customize')
              }
            }}
            className="w-full flex items-center justify-center font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 text-sm mt-auto shadow-sm hover:shadow bg-orange text-white hover:bg-orange/90"
          >
            {actionLabel}
          </a>
        ) : (
          <Link
            href={actionLink}
            className={`w-full flex items-center justify-center font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 text-sm mt-auto shadow-sm hover:shadow ${
              plan.is_popular
                ? 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
                : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    )
  }

  return (
    <section id="plans" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-sm font-bold text-orange uppercase tracking-widest">Subscription Options</span>
          <h2 className="section-heading mt-3">
            Choose Your <span className="text-forest">Fruit Dabba</span>
          </h2>
          <p className="section-sub max-w-xl mx-auto">
            Subscribe once and enjoy fresh, handpicked fruits & salads delivered daily to your doorstep.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl bg-gray-100 p-1.5 border border-gray-200 shadow-inner">
            <button
              onClick={() => setActiveTab('fruits')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'fruits'
                  ? 'bg-white text-gray-900 shadow-sm font-extrabold ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🍎</span> Daily Fruit Packs
            </button>
            <button
              onClick={() => setActiveTab('salads')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'salads'
                  ? 'bg-white text-gray-900 shadow-sm font-extrabold ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>💪</span> Wellness Salads & Gym
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-white text-gray-900 shadow-sm font-extrabold ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>⚙️</span> Custom Box Builder
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'fruits' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              {fruitPlans.map(renderPlanCard)}
            </div>
          )}

          {activeTab === 'salads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-8 animate-fadeIn">
              {saladPlans.map(renderPlanCard)}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 animate-fadeIn items-stretch">
              {customPlans.map(renderPlanCard)}
              
              {/* Interactive custom box CTA block */}
              <div className="border border-dashed border-gray-300 rounded-3xl p-8 flex flex-col justify-between bg-[#fdf0d5]/30 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-28 h-28 rounded-full bg-orange/5 pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange/15 text-orange flex items-center justify-center mb-5 shadow-sm">
                    <Sparkles className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-950 mb-3">
                    Design Your Own Dabba
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-6">
                    Not looking for standard portions? Use our custom builder to tailor categories, declare fruit dislikes (which we swap for free), and add premium fruit bowls directly. Price dynamically adjusts based on what you select.
                  </p>
                  
                  <div className="space-y-3.5 mb-8">
                    {[
                      'Add or remove categories (+₹300 - ₹600)',
                      'Exclude fruits you dislike (Free swap)',
                      'Daily delivery slot preferences',
                      'Dynamically append premium fruit bowl add-ons'
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center text-[10px] font-bold">✓</span>
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="#customize"
                  onClick={(e) => {
                    e.preventDefault()
                    const customSec = document.getElementById('customize')
                    if (customSec) {
                      customSec.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      router.push('/#customize')
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 text-sm bg-gray-950 text-white hover:bg-black shadow-sm"
                >
                  Configure Custom Box <ChevronRight size={16} />
                </a>
              </div>
            </div>
          )}
        </div>

        {plans.length === 0 && (
          <p className="text-center text-gray-400">No plans configured yet.</p>
        )}
      </div>
    </section>
  )
}
