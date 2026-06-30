'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, MessageSquare, Check, Trash2, Calendar, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  category: string
  title: string | null
  body: string
  image_url: string | null
  is_approved: boolean
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'fruit-box': '🍎 Fruit Box',
  'juice': '🥤 Fresh Juice',
  'oat-meal': '🥣 Oat Meal',
  'salad-bowl': '🥗 Salad Bowl',
  'protein-bowl': '💪 Protein Bowl',
}

const supabase = createClient()

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [actioningId, setActioningId] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleApprove = async (id: string) => {
    setActioningId(id)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      )
      toast.success('Review approved successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve review')
    } finally {
      setActioningId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete/reject this review?')) return
    setActioningId(id)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error

      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setActioningId(null)
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved
    if (filter === 'approved') return r.is_approved
    return true
  })

  // Stats calculation
  const totalReviews = reviews.length
  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.filter((r) => r.is_approved).length
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-forest" /> Review Moderation
          </h1>
          <p className="text-gray-500 text-sm mt-1">Approve or reject customer reviews before they appear live on the website.</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="btn-outline text-xs px-4 py-2 flex items-center gap-2"
        >
          {loading && <Loader2 size={12} className="animate-spin" />} Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Reviews', value: totalReviews, desc: 'All reviews submitted' },
          { label: 'Pending Approval', value: pendingCount, desc: 'Needs manual verification', highlight: pendingCount > 0 },
          { label: 'Approved Reviews', value: approvedCount, desc: 'Visible on landing page' },
          { label: 'Average Rating', value: avgRating + ' ★', desc: 'Out of 5 stars' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1.5 ${stat.highlight ? 'text-orange font-extrabold' : 'text-gray-900'}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-sm mb-6">
        {[
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'approved', label: 'Approved' },
          { id: 'all', label: 'All Reviews' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-white text-forest shadow-sm font-extrabold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-soft">
          <Loader2 className="animate-spin text-forest mx-auto mb-4" size={32} />
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-soft">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No reviews found</h3>
          <p className="text-gray-400 text-xs mt-1">There are no reviews matching the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-3xl p-6 border shadow-soft flex flex-col gap-4 relative transition-all ${
                !review.is_approved ? 'border-orange/20 ring-1 ring-orange/5 bg-orange/[0.01]' : 'border-gray-150'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{review.reviewer_name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                      {CATEGORY_LABELS[review.category] || review.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'fill-orange text-orange' : 'fill-gray-100 text-gray-200'}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Calendar size={10} />
                      {format(new Date(review.created_at), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {review.is_approved ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#22c55e] bg-green-50 border border-green-200/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye size={10} /> Live
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-orange bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <EyeOff size={10} /> Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              {review.image_url && (
                <div className="rounded-2xl overflow-hidden h-40 bg-gray-50 border border-gray-100 relative group">
                  <img
                    src={review.image_url}
                    alt="Review attachment"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={review.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    View Full Image ↗
                  </a>
                </div>
              )}

              {/* Quote */}
              <div className="flex-1">
                {review.title && <h4 className="font-extrabold text-gray-900 text-sm mb-1">{review.title}</h4>}
                <p className="text-gray-600 text-xs leading-relaxed italic">"{review.body}"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100">
                {!review.is_approved && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actioningId === review.id}
                    className="flex-1 btn-primary bg-forest hover:bg-forest-light text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    {actioningId === review.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Approve Review
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actioningId === review.id}
                  className={`btn-outline border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    !review.is_approved ? 'w-24' : 'flex-1'
                  }`}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
