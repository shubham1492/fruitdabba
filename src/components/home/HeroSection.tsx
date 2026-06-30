'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    category: '🍎 Daily Fruit Box',
    label: 'Fresh Seasonal Fruits',
    color: '#22c55e',
    bg: 'from-green-50 to-emerald-100',
    image: '/images/hero-fruit-box.png',
    alt: 'Fresh seasonal fruit box with mangoes, strawberries, kiwi and more',
    floatEmojis: [
      { emoji: '🍊', top: '8%', left: '6%', anim: 0 },
      { emoji: '🍇', top: '10%', right: '7%', anim: 1 },
      { emoji: '🥝', top: '42%', left: '3%', anim: 2 },
      { emoji: '🍓', top: '42%', right: '3%', anim: 3 },
      { emoji: '🥭', bottom: '18%', left: '6%', anim: 4 },
    ],
  },
  {
    category: '🥤 Fresh Juice',
    label: 'Cold-Pressed Daily Juices',
    color: '#f97316',
    bg: 'from-orange-50 to-amber-100',
    image: '/images/hero-juice.png',
    alt: 'Fresh cold-pressed fruit juices in vibrant colors',
    floatEmojis: [
      { emoji: '🍋', top: '8%', left: '6%', anim: 1 },
      { emoji: '🍊', top: '10%', right: '7%', anim: 0 },
      { emoji: '🌿', top: '42%', left: '3%', anim: 3 },
      { emoji: '🥕', top: '42%', right: '3%', anim: 2 },
      { emoji: '🍎', bottom: '18%', left: '6%', anim: 4 },
    ],
  },
  {
    category: '🥣 Oat Meal',
    label: 'Nutritious Oat Meals',
    color: '#d97706',
    bg: 'from-amber-50 to-yellow-100',
    image: '/images/hero-oat-meal.png',
    alt: 'Nutritious oatmeal bowl topped with fresh fruits and nuts',
    floatEmojis: [
      { emoji: '🍌', top: '8%', left: '6%', anim: 2 },
      { emoji: '🫐', top: '10%', right: '7%', anim: 3 },
      { emoji: '🍯', top: '42%', left: '3%', anim: 0 },
      { emoji: '🥜', top: '42%', right: '3%', anim: 1 },
      { emoji: '🍓', bottom: '18%', left: '6%', anim: 4 },
    ],
  },
  {
    category: '🥗 Fresh Salad Bowl',
    label: 'Daily Salad Subscription',
    color: '#059669',
    bg: 'from-emerald-50 to-green-100',
    image: '/images/hero-salad.png',
    alt: 'Fresh colorful salad bowl with paneer, avocado and vegetables',
    floatEmojis: [
      { emoji: '🥦', top: '8%', left: '6%', anim: 3 },
      { emoji: '🍅', top: '10%', right: '7%', anim: 2 },
      { emoji: '🥒', top: '42%', left: '3%', anim: 1 },
      { emoji: '🌽', top: '42%', right: '3%', anim: 4 },
      { emoji: '🥑', bottom: '18%', left: '6%', anim: 0 },
    ],
  },
  {
    category: '💪 Protein Gym Bowl',
    label: 'High-Protein Recovery Bowl',
    color: '#7c3aed',
    bg: 'from-purple-50 to-violet-100',
    image: '/images/hero-protein.png',
    alt: 'High protein fitness bowl with paneer, chickpeas and quinoa',
    floatEmojis: [
      { emoji: '🥑', top: '8%', left: '6%', anim: 4 },
      { emoji: '🫘', top: '10%', right: '7%', anim: 0 },
      { emoji: '🌿', top: '42%', left: '3%', anim: 2 },
      { emoji: '⚡', top: '42%', right: '3%', anim: 3 },
      { emoji: '💪', bottom: '18%', left: '6%', anim: 1 },
    ],
  },
]

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % SLIDES.length)
        setIsTransitioning(false)
      }, 350)
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  const goTo = (idx: number) => {
    if (idx === activeIdx) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveIdx(idx)
      setIsTransitioning(false)
    }, 300)
  }

  const slide = SLIDES[activeIdx]

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 sm:pt-12 sm:pb-24">
      <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-forest/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:items-start items-center relative z-10">

        {/* ── Left: Text content ── */}
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-1.5 text-sm font-semibold text-[#22c55e]">
            🌿 Fresh, handpicked &amp; delivered daily
          </span>
          <h1 className="mt-6 text-balance text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            Healthy Fruits.<br /><span className="text-[#22c55e]">Delivered Every Day.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
            Subscribe to Daily Fruits, Fresh Salad, Oat Meals, Juice or Protein Bowls — each as a separate daily subscription delivered to your doorstep.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
            <a
              href="#plans"
              onClick={(e) => { e.preventDefault(); document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="btn-primary flex items-center justify-center h-12 px-7 text-base font-bold text-center rounded-full cursor-pointer"
            >
              🍎 Start Subscription
            </a>
            <a
              href="#categories"
              onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="flex items-center justify-center h-12 px-7 text-base font-bold text-center bg-orange text-white hover:bg-orange/90 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer"
            >
              🥗 Explore All Categories
            </a>
            <a
              href="#customize"
              onClick={(e) => { e.preventDefault(); document.getElementById('customize')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="flex items-center justify-center h-12 px-7 text-base font-bold text-center border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer"
            >
              ⚙️ Customize My Box
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full border-t border-gray-100 pt-6">
            {[
              { emoji: '🚜', text: 'Farm Fresh Fruits' },
              { emoji: '🔍', text: 'Quality Checked' },
              { emoji: '📅', text: 'Flexible Subscription' },
              { emoji: '🚚', text: 'Doorstep Delivery' }
            ].map((indicator, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xl">{indicator.emoji}</span>
                <span className="text-xs font-bold text-gray-700 leading-tight">{indicator.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {['AS', 'RM', 'KN', 'PD'].map((initials, i) => (
                <span key={i} className={`flex w-9 h-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${i % 2 === 0 ? 'bg-[#22c55e]' : 'bg-orange'}`}>
                  {initials}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-orange text-lg">★★★★★</div>
              <p className="mt-0.5 text-sm font-medium text-gray-500">
                <span className="font-bold text-gray-900">4.9/5</span> from 10,000+ happy subscribers
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-gray-400">
            No lock-in · Pause or cancel anytime · Free first delivery
          </p>
        </div>

        {/* ── Right: Sliding image showcase ── */}
        <div className="relative flex justify-center items-center lg:pt-8">

          {/* Glowing background circle */}
          <div
            className={`absolute inset-0 -z-10 m-auto w-[85%] h-[85%] rounded-full bg-gradient-to-br ${slide.bg} blur-2xl transition-all duration-700`}
          />

          {/* Image card */}
          <div className="relative w-full max-w-md aspect-square">

            {/* Floating emoji decorations — render first so they're behind the card frame */}
            {slide.floatEmojis.map((fe, i) => (
              <span
                key={`${activeIdx}-${i}`}
                className={`absolute z-20 text-3xl pointer-events-none select-none transition-opacity duration-400 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                style={{
                  top: fe.top,
                  bottom: (fe as any).bottom,
                  left: fe.left,
                  right: (fe as any).right,
                  animation: `floatE${fe.anim} ${3.2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                }}
              >
                {fe.emoji}
              </span>
            ))}

            {/* Main image container */}
            <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl transition-all duration-400 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              style={{ animation: isTransitioning ? 'none' : 'floatCard 4s ease-in-out infinite' }}
            >
              {/* Gradient overlay at top for badge readability */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent z-10" />

              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />

              {/* Category badge */}
              <div
                className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-white shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: `${slide.color}dd` }}
              >
                {slide.category}
              </div>

              {/* Bottom label strip */}
              <div className="absolute bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">{slide.label}</span>
                {/* Dot progress */}
                <div className="flex gap-1.5 items-center">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      className="rounded-full border-0 p-0 cursor-pointer transition-all duration-300"
                      style={{
                        width: i === activeIdx ? '20px' : '6px',
                        height: '6px',
                        backgroundColor: i === activeIdx ? slide.color : '#d1d5db',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery badge */}
          <div className="absolute -bottom-5 left-4 sm:left-8 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl z-30">
            <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-[#22c55e]/10 text-xl">🚚</span>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">10,000+ boxes</p>
              <p className="text-xs text-gray-500">delivered fresh &amp; on time</p>
            </div>
          </div>

          {/* Side dot nav */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-30">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="rounded-full border-2 border-white shadow transition-all duration-300 cursor-pointer"
                style={{
                  width: '12px', height: '12px',
                  transform: i === activeIdx ? 'scale(1.4)' : 'scale(1)',
                  backgroundColor: i === activeIdx ? slide.color : '#d1d5db',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatE0 {
          0%, 100% { transform: translateY(0px) rotate(-5deg) scale(1); }
          50% { transform: translateY(-16px) rotate(6deg) scale(1.1); }
        }
        @keyframes floatE1 {
          0%, 100% { transform: translateY(0px) rotate(4deg) scale(1); }
          50% { transform: translateY(-10px) rotate(-7deg) scale(1.08); }
        }
        @keyframes floatE2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-18px) rotate(10deg) scale(1.12); }
        }
        @keyframes floatE3 {
          0%, 100% { transform: translateY(0px) rotate(-8deg) scale(1); }
          50% { transform: translateY(-8px) rotate(5deg) scale(1.06); }
        }
        @keyframes floatE4 {
          0%, 100% { transform: translateY(0px) rotate(6deg) scale(1); }
          50% { transform: translateY(-14px) rotate(-5deg) scale(1.1); }
        }
      `}</style>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 66.7C120 53.3 240 26.7 360 16C480 5.3 600 10.7 720 21.3C840 32 960 48 1080 53.3C1200 58.7 1320 53.3 1380 50.7L1440 48V80H0Z" fill="#fef9f0" />
        </svg>
      </div>
    </section>
  )
}
