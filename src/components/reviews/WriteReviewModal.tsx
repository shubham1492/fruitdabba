'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Star, Upload, Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'fruit-box', label: '🍎 Daily Fruit Box' },
  { id: 'juice', label: '🥤 Fresh Juice' },
  { id: 'oat-meal', label: '🥣 Oat Meal' },
  { id: 'salad-bowl', label: '🥗 Fresh Salad Bowl' },
  { id: 'protein-bowl', label: '💪 Protein Gym Bowl' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  orderId?: string
  defaultCategory?: string
}

const supabase = createClient()

export default function WriteReviewModal({ isOpen, onClose, orderId, defaultCategory }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState(defaultCategory || '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!category) { toast.error('Please select a category'); return }
    if (!body.trim()) { toast.error('Please write your review'); return }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      let imageUrl: string | null = null

      // Upload image to Supabase Storage if provided
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `reviews/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, imageFile, { contentType: imageFile.type })

        if (uploadError) {
          console.warn('Image upload failed, proceeding without image:', uploadError.message)
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('review-images').getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      // Insert review
      const { error } = await supabase.from('reviews').insert({
        user_id: user?.id || null,
        order_id: orderId || null,
        category,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        image_url: imageUrl,
        reviewer_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous',
        is_approved: false, // Admin approves first
      })

      if (error) throw error

      setSubmitted(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setRating(0); setHoverRating(0); setCategory(''); setTitle('')
    setBody(''); setImageFile(null); setImagePreview(null); setSubmitted(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <button onClick={resetAndClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-extrabold text-gray-900">Share Your Experience</h2>
          <p className="text-sm text-gray-500 mt-0.5">Help others discover the freshness 🍎</p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-[#22c55e]" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Review Submitted! 🎉</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Thank you for your review. It will appear on our website once approved by our team (usually within 24 hours).
            </p>
            <button onClick={resetAndClose} className="mt-8 bg-[#22c55e] text-white font-bold px-8 py-3 rounded-2xl hover:bg-green-600 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">

            {/* Star Rating */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">
                Your Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={`transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-orange text-orange'
                          : 'fill-gray-100 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="ml-2 text-sm font-bold text-gray-600">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">
                Which Subscription? <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                Review Title <span className="text-gray-300">(optional)</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best fruits I've ever tasted!"
                maxLength={80}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            {/* Review Body */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                Your Review <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell us about your experience with the freshness, taste, delivery, packaging..."
                rows={4}
                maxLength={500}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium placeholder-gray-300 focus:outline-none focus:border-[#22c55e] transition-colors resize-none"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{body.length}/500</div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                Add a Photo <span className="text-gray-300">(optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#22c55e]/30">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">
                    {imageFile?.name}
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#22c55e] bg-[#22c55e]/5'
                      : 'border-gray-200 hover:border-[#22c55e]/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Camera size={22} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        {isDragging ? 'Drop your photo here' : 'Upload your food photo'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click · JPG, PNG up to 5MB</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#22c55e]">
                      <Upload size={12} /> Browse files
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-green-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl transition-all text-sm shadow-sm"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Star size={16} className="fill-white text-white" />}
              {submitting ? 'Submitting...' : 'Submit My Review'}
            </button>

            <p className="text-center text-[10px] text-gray-400 -mt-2">
              Reviews are reviewed by our team before appearing publicly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
