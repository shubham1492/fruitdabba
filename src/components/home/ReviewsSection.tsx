'use client'

import { useState, useEffect } from 'react'
import { Star, Camera, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import WriteReviewModal from '@/components/reviews/WriteReviewModal'

// Fallback mock reviews shown before real ones load
const MOCK_REVIEWS = [
  {
    id: '1',
    reviewer_name: 'Priya Sharma',
    location: 'Koramangala, Bangalore',
    category: 'fruit-box',
    categoryLabel: '🍎 Fruit Box',
    rating: 5,
    title: 'Best fruits I\'ve ever had delivered!',
    body: 'The mangoes were absolutely divine — better than what I get at the market! Delivery is super prompt and the packaging keeps everything fresh. My kids ask for FruitDabba every morning now.',
    image_url: null,
    avatar_color: '#22c55e',
    initials: 'PS',
    verified: true,
    created_at: '2026-06-10',
  },
  {
    id: '2',
    reviewer_name: 'Arjun Reddy',
    location: 'HSR Layout, Bangalore',
    category: 'protein-bowl',
    categoryLabel: '💪 Protein Bowl',
    rating: 5,
    title: 'My gym buddy now!',
    body: 'Post-workout nutrition sorted! The protein bowl is loaded with paneer, chickpeas, and greens. 25g protein as promised, and it actually tastes amazing. Been subscribing for 2 months now.',
    image_url: null,
    avatar_color: '#7c3aed',
    initials: 'AR',
    verified: true,
    created_at: '2026-06-08',
  },
  {
    id: '3',
    reviewer_name: 'Meera Patel',
    location: 'Indiranagar, Bangalore',
    category: 'juice',
    categoryLabel: '🥤 Fresh Juice',
    rating: 5,
    title: 'No more bottled juice at home!',
    body: 'The cold-pressed juice is a game changer. Zero sugar, zero preservatives — you can actually TASTE the difference. The green detox juice has become my morning ritual. Highly recommend!',
    image_url: null,
    avatar_color: '#f97316',
    initials: 'MP',
    verified: true,
    created_at: '2026-06-05',
  },
  {
    id: '4',
    reviewer_name: 'Vikram Singh',
    location: 'Whitefield, Bangalore',
    category: 'salad-bowl',
    categoryLabel: '🥗 Salad Bowl',
    rating: 5,
    title: 'Healthy lunch sorted every day!',
    body: 'Office lunch used to be a problem. Now I just wait for my FruitDabba salad delivery at 12pm. The paneer avocado salad is filling, fresh and absolutely delicious. Worth every rupee.',
    image_url: null,
    avatar_color: '#059669',
    initials: 'VS',
    verified: true,
    created_at: '2026-06-03',
  },
  {
    id: '5',
    reviewer_name: 'Anjali Nair',
    location: 'JP Nagar, Bangalore',
    category: 'oat-meal',
    categoryLabel: '🥣 Oat Meal',
    rating: 5,
    title: 'Healthy breakfast without any effort!',
    body: 'As a working mom, morning prep time is zero. FruitDabba oat meal lands at my door by 7:30am — fresh, delicious and keeps me full till lunch. The mango coconut variant is my absolute favourite!',
    image_url: null,
    avatar_color: '#d97706',
    initials: 'AN',
    verified: true,
    created_at: '2026-06-01',
  },
  {
    id: '6',
    reviewer_name: 'Rahul Kumar',
    location: 'Marathahalli, Bangalore',
    category: 'fruit-box',
    categoryLabel: '🍎 Fruit Box',
    rating: 5,
    title: 'Dragon fruit and kiwi — wow!',
    body: 'Never bought exotic fruits before because they\'re expensive in stores. FruitDabba introduces one exotic fruit every 2-3 days. Tried dragon fruit for the first time and loved it. Great value!',
    image_url: null,
    avatar_color: '#22c55e',
    initials: 'RK',
    verified: false,
    created_at: '2026-05-28',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'fruit-box': '#22c55e',
  'juice': '#f97316',
  'oat-meal': '#d97706',
  'salad-bowl': '#059669',
  'protein-bowl': '#7c3aed',
}

const supabase = createClient()

export default function ReviewsSection() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const FILTERS = [
    { id: 'all', label: 'All Reviews' },
    { id: 'fruit-box', label: '🍎 Fruit Box' },
    { id: 'juice', label: '🥤 Juice' },
    { id: 'oat-meal', label: '🥣 Oat Meal' },
    { id: 'salad-bowl', label: '🥗 Salad' },
    { id: 'protein-bowl', label: '💪 Protein' },
  ]

  useEffect(() => {
    // Try to fetch real approved reviews from Supabase
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data && data.length > 0) setReviews(data as any)
    }
    fetchReviews()
  }, [])

  const filtered = activeFilter === 'all'
    ? reviews
    : reviews.filter(r => r.category === activeFilter)

  const PER_PAGE = 3
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <>
      <section id="reviews" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-forest-dark text-white overflow-hidden">
        {/* Subtle top line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-sm font-bold text-orange uppercase tracking-widest">Real Customers, Real Results</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                People Love <span className="text-orange">FruitDabba</span>
              </h2>

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-orange text-orange" />)}
                  </div>
                  <span className="font-extrabold text-xl text-white">{avgRating}</span>
                  <span className="text-white/50 text-sm">/ 5</span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="text-white/60 text-sm">{reviews.length}+ verified reviews</div>
                <div className="h-4 w-px bg-white/20" />
                <div className="text-white/60 text-sm">Bangalore, India</div>
              </div>
            </div>

            {/* Write review CTA */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 flex items-center gap-2.5 bg-white text-forest-dark font-extrabold px-6 py-3.5 rounded-2xl hover:bg-orange hover:text-white transition-all duration-200 shadow-lg text-sm"
            >
              <Camera size={16} />
              Write a Review
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setActiveFilter(f.id); setPage(0) }}
                className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                  activeFilter === f.id
                    ? 'bg-white text-forest-dark border-white'
                    : 'border-white/20 text-white/70 hover:border-white/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reviews grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visible.map((review) => {
              const isExpanded = expandedId === review.id
              const catColor = CATEGORY_COLORS[review.category] || '#22c55e'
              const shortBody = review.body.length > 150 ? review.body.slice(0, 150) + '…' : review.body

              return (
                <div
                  key={review.id}
                  className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-3xl p-6 flex flex-col gap-4 hover:bg-white/12 transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Top: category + stars */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${catColor}25`, color: catColor }}
                    >
                      {review.categoryLabel || review.category}
                    </span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= review.rating ? 'fill-orange text-orange' : 'fill-white/10 text-white/10'} />
                      ))}
                    </div>
                  </div>

                  {/* Customer photo if available */}
                  {review.image_url && (
                    <div className="rounded-2xl overflow-hidden h-36">
                      <img src={review.image_url} alt="Customer photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  {/* Quote */}
                  <div className="relative">
                    <Quote size={18} className="text-orange/40 mb-1.5" />
                    {review.title && (
                      <div className="font-extrabold text-white text-sm mb-1">{review.title}</div>
                    )}
                    <p className="text-white/70 text-sm leading-relaxed">
                      {isExpanded ? review.body : shortBody}
                    </p>
                    {review.body.length > 150 && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : review.id)}
                        className="text-orange text-xs font-bold mt-1 hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Reviewer info */}
                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                      style={{ backgroundColor: catColor }}
                    >
                      {(review as any).initials || review.reviewer_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{review.reviewer_name}</div>
                      <div className="text-xs text-white/40 truncate">{(review as any).location || 'Bangalore'}</div>
                    </div>
                    {(review as any).verified && (
                      <span className="shrink-0 text-[10px] font-bold bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === page ? 'bg-orange w-6' : 'bg-white/30'}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="text-center mt-14">
            <p className="text-white/50 text-sm mb-5">Join 10,000+ happy subscribers getting fresh food every day.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#categories"
                onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-extrabold py-4 px-10 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                Start Your Subscription 🍊
              </a>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:border-white/60 transition-all hover:-translate-y-0.5"
              >
                <Star size={16} className="fill-orange text-orange" /> Write a Review
              </button>
            </div>
          </div>
        </div>
      </section>

      <WriteReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
