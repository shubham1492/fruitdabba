'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Info, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

interface FruitPreference {
  name: string
  emoji: string
  category: string
}

const FRUIT_LIST: FruitPreference[] = [
  { name: 'Alphonso Mango', emoji: '🥭', category: 'Seasonal Fruits' },
  { name: 'Custard Apple', emoji: '🍈', category: 'Seasonal Fruits' },
  { name: 'Seedless Grapes', emoji: '🍇', category: 'Seasonal Fruits' },
  { name: 'Kiwi Fruit', emoji: '🥝', category: 'Exotic Fruits' },
  { name: 'Dragon Fruit', emoji: '🐲', category: 'Exotic Fruits' },
  { name: 'Blueberries', emoji: '🫐', category: 'Exotic Fruits' },
  { name: 'Avocado', emoji: '🥑', category: 'High Protein Fruits' },
  { name: 'Fresh Guava', emoji: '🍏', category: 'High Protein Fruits' },
  { name: 'Fresh Bananas', emoji: '🍌', category: 'High Protein Fruits' },
  { name: 'Fresh Strawberries', emoji: '🍓', category: 'Weight Loss Fruits' },
  { name: 'Watermelon', emoji: '🍉', category: 'Weight Loss Fruits' },
  { name: 'Navel Orange', emoji: '🍊', category: 'Immunity Boosting Fruits' },
  { name: 'Pineapple', emoji: '🍍', category: 'Immunity Boosting Fruits' },
]

const CATEGORIES = [
  'Seasonal Fruits',
  'Exotic Fruits',
  'High Protein Fruits',
  'Weight Loss Fruits',
  'Immunity Boosting Fruits'
]

export default function CustomizeDabbaSection() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'basic-pack' | 'mini-pack' | 'medium-pack' | 'premium-pack' | 'gym-protein-pack' | 'corn-chaat-pack' | 'custom-pack'>('medium-pack')
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'general'>('morning')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES)
  const [likes, setLikes] = useState<string[]>(['Alphonso Mango', 'Kiwi Fruit', 'Fresh Strawberries', 'Navel Orange'])
  const [dislikes, setDislikes] = useState<string[]>(['Pineapple'])


  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleFruitClick = (name: string, status: 'like' | 'dislike' | 'neutral') => {
    if (status === 'like') {
      setLikes(prev => prev.filter(n => n !== name))
      setDislikes(prev => [...prev.filter(n => n !== name), name])
    } else if (status === 'dislike') {
      setDislikes(prev => prev.filter(n => n !== name))
    } else {
      setLikes(prev => [...prev.filter(n => n !== name), name])
    }
  }

  const getPrice = () => {
    let base = 3060
    if (selectedPlan === 'basic-pack') base = 3060
    else if (selectedPlan === 'mini-pack') base = 3580
    else if (selectedPlan === 'medium-pack') base = 4100
    else if (selectedPlan === 'premium-pack') base = 4620
    else if (selectedPlan === 'gym-protein-pack') base = 4999
    else if (selectedPlan === 'corn-chaat-pack') base = 3990
    else if (selectedPlan === 'custom-pack') {
      base = 3000
      selectedCategories.forEach(cat => {
        if (cat === 'Exotic Fruits') base += 600
        else if (cat === 'Immunity Boosting Fruits') base += 300
        else if (cat === 'High Protein Fruits') base += 300
        else if (cat === 'Weight Loss Fruits') base += 300
        else if (cat === 'Seasonal Fruits') base += 200
      })
    }
    return base
  }

  const handleSubscribe = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one fruit category!')
      return
    }

    const likesStr = encodeURIComponent(likes.join(','))
    const dislikesStr = encodeURIComponent(dislikes.join(','))
    const categoriesStr = encodeURIComponent(selectedCategories.join(','))

    router.push(
      `/checkout?plan=${selectedPlan}&likes=${likesStr}&dislikes=${dislikesStr}&slot=${deliverySlot}&categories=${categoriesStr}`
    )
  }

  return (
    <section id="customize" className="py-20 sm:py-28 bg-[#fdf0d5]/40 relative overflow-hidden">
      {/* Decorative fruits floating */}
      <div className="absolute top-10 left-10 text-5xl opacity-10 animate-float">🍋</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-10 animate-float-delay">🥭</div>
      <div className="absolute top-1/2 right-12 text-5xl opacity-10 animate-float-delay-2">🥝</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-orange">
            Interactive Box Builder
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
            Customize Your <span className="text-[#22c55e]">Fruit Box</span>
          </h2>
          <p className="text-gray-600 text-lg mt-4 leading-relaxed">
            Tailor your daily box based on your health goals, taste preferences, and premium add-ons. We pack only what you love!
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Configurator (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Subscription & Portion Pack */}
            <div className="card p-6 md:p-8 bg-white border border-gray-150 shadow-soft">
              <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center font-bold text-sm">1</span>
                Choose Daily Pack & Options
              </h3>

              {/* Plan selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Subscription Pack Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'basic-pack', label: 'Basic Pack', sub: '300-350g · ₹3,060' },
                    { id: 'mini-pack', label: 'Mini Pack', sub: '400-450g · ₹3,580' },
                    { id: 'medium-pack', label: 'Medium Pack', sub: '500-550g · ₹4,100' },
                    { id: 'premium-pack', label: 'Premium Pack', sub: '700-750g · ₹4,620' },
                    { id: 'gym-protein-pack', label: 'Gym High Protein Pack', sub: 'Gym Salads · ₹4,999' },
                    { id: 'corn-chaat-pack', label: 'Corn Chaat & Salad Pack', sub: 'Tangy Salads · ₹3,990' },
                    { id: 'custom-pack', label: 'Custom Dabba Pack', sub: 'Builder Pack · ₹3,000+' }
                  ].map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as any)}
                      type="button"
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? 'border-[#22c55e] bg-[#22c55e]/5 shadow-sm text-gray-900 ring-2 ring-[#22c55e]/20'
                          : 'border-gray-250 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{plan.label}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">{plan.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Options */}
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Preferred Delivery Slot</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'morning', label: 'Morning Slot', desc: '7:00 AM - 9:00 AM' },
                      { id: 'general', label: 'General Slot', desc: '9:00 AM - 7:00 PM' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setDeliverySlot(item.id as any)}
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          deliverySlot === item.id
                            ? 'border-[#22c55e] bg-[#22c55e]/5 text-gray-900 shadow-sm font-bold ring-2 ring-[#22c55e]/15'
                            : 'border-gray-250 bg-white hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{item.label}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tip about separate subscriptions */}
              <div className="mt-6 border-t border-gray-100 pt-6 bg-green-50/60 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-bold text-sm text-gray-800">Want juice, oats, or salad too?</div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Each food type is a separate subscription. Head to our <a href="#categories" onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-[#22c55e] font-bold underline cursor-pointer">Subscription Categories</a> section to add Juice, Oat Meal, Salad, or Protein Bowl subscriptions independently.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Target Categories */}
            <div className="card p-6 md:p-8 bg-white border border-gray-150 shadow-soft">
              <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-orange/10 text-orange flex items-center justify-center font-bold text-sm">2</span>
                Choose Target Categories
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Filter down what kinds of fruits you prefer in your curated box. We recommend keeping all categories selected for maximum diversity.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      type="button"
                      className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#22c55e] text-white border-transparent shadow-md hover:bg-[#16a34a]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Taste Preference Toggles */}
            <div className="card p-6 md:p-8 bg-white border border-gray-150 shadow-soft">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">3</span>
                Customize Fruit Tastes
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Click fruit cards to toggle: <span className="text-[#22c55e] font-bold">Like (Green)</span>, <span className="text-orange font-bold">Dislike (Orange)</span>, or Neutral (White). We will swap dislikes with other fresh fruits!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FRUIT_LIST.map(fruit => {
                  const isLiked = likes.includes(fruit.name)
                  const isDisliked = dislikes.includes(fruit.name)
                  
                  let bgClass = 'bg-white border-gray-200 text-gray-800'
                  let icon = '⚪'
                  let state: 'like' | 'dislike' | 'neutral' = 'neutral'

                  if (isLiked) {
                    bgClass = 'bg-green-50 border-green-200 text-green-800 ring-2 ring-green-100'
                    icon = '👍'
                    state = 'like'
                  } else if (isDisliked) {
                    bgClass = 'bg-orange-50 border-orange-200 text-orange-800 ring-2 ring-orange-100'
                    icon = '👎'
                    state = 'dislike'
                  }

                  return (
                    <button
                      key={fruit.name}
                      onClick={() => handleFruitClick(fruit.name, state)}
                      type="button"
                      className={`p-3 rounded-2xl border text-center transition-all duration-300 hover:shadow-sm cursor-pointer flex flex-col items-center justify-center min-h-[100px] ${bgClass}`}
                    >
                      <div className="text-3xl mb-1">{fruit.emoji}</div>
                      <div className="font-bold text-xs tracking-tight leading-tight line-clamp-1">{fruit.name}</div>
                      <div className="text-[10px] mt-1.5 font-bold uppercase tracking-wider opacity-60 flex items-center gap-0.5">
                        <span>{icon}</span>
                        {state}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Simulator & Price Box (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="card p-6 md:p-8 bg-forest-dark text-white shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] bg-orange text-white font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    Your Curated Box
                  </span>
                  <h3 className="text-xl font-bold mt-2">Dabba Simulation</h3>
                </div>
                <div className="text-3xl">📦</div>
              </div>

              {/* Simulation summary */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-4 mb-8 text-sm">
                <div className="flex justify-between border-b border-white/15 pb-2">
                  <span className="text-white/60">Subscription:</span>
                  <span className="font-bold capitalize">{selectedPlan.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between border-b border-white/15 pb-2">
                  <span className="text-white/60">Portion Weight:</span>
                  <span className="font-bold">
                    {selectedPlan === 'basic-pack' ? '300-350 gms' :
                     selectedPlan === 'mini-pack' ? '400-450 gms' :
                     selectedPlan === 'medium-pack' ? '500-550 gms' :
                     selectedPlan === 'premium-pack' ? '700-750 gms' :
                     selectedPlan === 'gym-protein-pack' ? 'High Protein Salad' :
                     selectedPlan === 'corn-chaat-pack' ? 'Corn Salad' :
                     'Custom Portion (300-750g)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/15 pb-2">
                  <span className="text-white/60">Delivery Slot:</span>
                  <span className="font-bold capitalize">{deliverySlot} Slot</span>
                </div>
                <div className="flex justify-between border-b border-white/15 pb-2">
                  <span className="text-white/60">Inclusions:</span>
                  <span className="font-bold text-xs text-right">
                    {selectedPlan === 'basic-pack' && 'Min 4-5 Fruits'}
                    {selectedPlan === 'mini-pack' && 'Min 4-5 Fruits'}
                    {selectedPlan === 'medium-pack' && '4-5 Fruits + Legumes'}
                    {selectedPlan === 'premium-pack' && '6-7 Fruits + Legumes + Nuts'}
                    {selectedPlan === 'gym-protein-pack' && 'Protein Salad Bowl'}
                    {selectedPlan === 'corn-chaat-pack' && 'Corn Chaat Salad'}
                    {selectedPlan === 'custom-pack' && 'Custom Selection'}
                  </span>
                </div>
                

                {/* Visual fruits list */}
                <div>
                  <span className="text-white/60 block mb-2 font-semibold">Included Fruits (curated):</span>
                  <div className="flex flex-wrap gap-2">
                    {FRUIT_LIST.filter(f => selectedCategories.includes(f.category) && !dislikes.includes(f.name))
                      .slice(0, 6)
                      .map(f => (
                        <span key={f.name} className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full text-xs font-medium">
                          {f.emoji} {f.name}
                        </span>
                      ))}
                    <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold italic opacity-80">
                      + Seasonal Surprises
                    </span>
                  </div>
                </div>

                {/* Excluded dislikes */}
                {dislikes.length > 0 && (
                  <div className="text-xs bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <span className="font-bold text-orange flex items-center gap-1">❌ Excluded Dislikes:</span>
                    <p className="text-white/70 mt-1">{dislikes.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Price Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Base Pack price:</span>
                  <span>
                    ₹{selectedPlan === 'basic-pack' ? 3060 :
                      selectedPlan === 'mini-pack' ? 3580 :
                      selectedPlan === 'medium-pack' ? 4100 :
                      selectedPlan === 'premium-pack' ? 4620 :
                      selectedPlan === 'gym-protein-pack' ? 4999 :
                      selectedPlan === 'corn-chaat-pack' ? 3990 :
                      3000
                    }
                  </span>
                </div>
                {selectedPlan === 'custom-pack' && (
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>Custom Category surcharge:</span>
                    <span>₹{selectedCategories.reduce((acc, curr) => acc + (curr === 'Exotic Fruits' ? 600 : ['Immunity Boosting Fruits', 'High Protein Fruits', 'Weight Loss Fruits'].includes(curr) ? 300 : curr === 'Seasonal Fruits' ? 200 : 0), 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Daily doorstep delivery:</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>
                <div className="border-t border-white/15 pt-3.5 flex justify-between items-baseline">
                  <span className="font-bold text-base">Total Cost:</span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-[#22c55e]">₹{getPrice()}</span>
                    <span className="text-xs text-white/50 block font-normal mt-0.5">
                      / 26 days
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                id="subscribe-custom-btn"
                className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-xl cursor-pointer"
              >
                <ShoppingBag size={18} />
                Subscribe Now
                <ChevronRight size={16} />
              </button>
              
              <div className="mt-4 flex items-center gap-2 justify-center text-xs text-white/50">
                <Sparkles size={12} className="text-orange" />
                <span>Pause, modify or swap fruits anytime</span>
              </div>
            </div>
            
            {/* Quick explanation */}
            <div className="bg-white rounded-2xl p-5 border border-gray-150 flex items-start gap-3 shadow-sm">
              <Info className="text-forest size-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">How Custom Boxes Work</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  Every week, we curate a box based on active crops and your category filters. Any fruits you have listed in "Dislikes" are automatically swapped out with equal value items from your preferred categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
