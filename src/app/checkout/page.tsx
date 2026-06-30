'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2, MapPin,
  Calendar, Clock,
  Smartphone, CreditCard, Truck, CheckCircle2, Gift, Lock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ReferralInput from '@/components/referral/ReferralInput'
import { applyReferralCode } from '@/lib/referral'
import { registerForPushNotifications } from '@/lib/push'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const supabase = createClient()

const TIME_SLOTS = [
  { value: '6-8am', label: '6 – 8 AM', icon: '🌅', desc: 'Early morning' },
  { value: '8-10am', label: '8 – 10 AM', icon: '☀️', desc: 'Morning' },
  { value: '10-12pm', label: '10 AM – 12 PM', icon: '🌤️', desc: 'Late morning' },
  { value: '12-2pm', label: '12 – 2 PM', icon: '🌞', desc: 'Afternoon' },
  { value: '5-7pm', label: '5 – 7 PM', icon: '🌇', desc: 'Evening' },
]

const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    desc: 'GPay, PhonePe, Paytm & more',
    icon: '📱',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay',
    icon: '💳',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    desc: 'Pay when your first box arrives',
    icon: '🏠',
    color: 'from-orange-500 to-amber-600',
  },
]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')

  const likes = searchParams.get('likes') ? decodeURIComponent(searchParams.get('likes')!).split(',').filter(Boolean) : []
  const dislikes = searchParams.get('dislikes') ? decodeURIComponent(searchParams.get('dislikes')!).split(',').filter(Boolean) : []
  const deliverySlotParam = searchParams.get('slot') || 'morning'
  const categories = searchParams.get('categories') ? decodeURIComponent(searchParams.get('categories')!).split(',').filter(Boolean) : []
  const portionAdjustment = searchParams.get('portion') || 'standard'

  const [loading, setLoading] = useState(false)
  const [fetchingPlan, setFetchingPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [authNeeded, setAuthNeeded] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [authOtpSent, setAuthOtpSent] = useState(false)
  const [authOtpLoading, setAuthOtpLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Delivery schedule
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(minDate)
  const [timeSlot, setTimeSlot] = useState('8-10am')
  const [carryForward, setCarryForward] = useState(true)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('upi')

  // Referral
  const [referralCode, setReferralCode] = useState('')

  // Promo code
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [promoError, setPromoError] = useState('')

  const PROMO_CODES: Record<string, { discount: number; label: string }> = {
    FIRSTBOX30: { discount: 0.30, label: '30% off first box' },
    FRUITLOVE: { discount: 0.15, label: '15% off your order' },
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Enter a promo code'); return }
    const found = PROMO_CODES[code]
    if (!found) { setPromoError('Invalid promo code'); setAppliedPromo(null); return }
    setAppliedPromo({ code, ...found })
    setPromoError('')
    setPromoInput('')
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
    setPromoInput('')
  }

  const [form, setForm] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })

  const planLoadedRef = useRef(false)

  const loadPlan = useCallback(async (id: string) => {
    if (planLoadedRef.current) return
    planLoadedRef.current = true
    setFetchingPlan(true)
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      const query = supabase.from('subscription_plans').select('*')
      const { data, error } = await (isUuid ? query.eq('id', id) : query.eq('slug', id)).single()
      if (error) throw error
      if (data) setSelectedPlan(data)
    } catch {
      toast.error('Failed to load subscription plan')
    } finally {
      setFetchingPlan(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) { setAuthNeeded(true); setAuthChecked(true); return }
      setUser({ id: user.id, email: user.email })
      setForm((f) => ({ ...f, name: f.name || user.user_metadata?.full_name || '', phone: f.phone || user.user_metadata?.phone || '' }))
      setAuthNeeded(false); setAuthChecked(true)
      if (planId) loadPlan(planId)
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!mounted) return
      if (session?.user) {
        const u = session.user
        setUser({ id: u.id, email: u.email })
        setForm((f) => ({ ...f, name: f.name || u.user_metadata?.full_name || '', phone: f.phone || u.user_metadata?.phone || '' }))
        setAuthNeeded(false); setAuthChecked(true)
        if (planId) loadPlan(planId)
        // Register for push notifications after login
        registerForPushNotifications(u.id).catch(() => {})
      } else { setUser(null); setAuthNeeded(true); setAuthChecked(true) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [planId, loadPlan])

  useEffect(() => {
    const saved = localStorage.getItem('selected_city') || 'Bangalore'
    setForm((f) => ({ ...f, city: f.city || saved }))

    const handleCityChanged = (e: Event) => {
      const newCity = (e as CustomEvent).detail
      setForm((f) => ({ ...f, city: newCity }))
    }
    window.addEventListener('cityChanged', handleCityChanged)
    return () => window.removeEventListener('cityChanged', handleCityChanged)
  }, [])

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true)
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/checkout${planId ? `%3Fplan%3D${planId}` : ''}` } })
        if (error) throw error
        toast.success('Sign up successful! Please check your email.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (error) throw error
        toast.success('Welcome back!')
      }
    } catch (err: any) { toast.error(err.message || 'Authentication failed') }
    finally { setAuthLoading(false) }
  }

  const handleInlineRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authName || authName.trim().length < 2) {
      toast.error('Please enter your full name')
      return
    }
    if (!authPhone || authPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    setAuthOtpLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${authPhone}`,
        options: { data: { full_name: authName } }
      })
      if (error) throw error
      setAuthOtpSent(true)
      toast.success('OTP sent successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setAuthOtpLoading(false)
    }
  }

  const handleInlineVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authOtp || authOtp.length < 6) {
      toast.error('Please enter a 6-digit OTP code')
      return
    }
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${authPhone}`,
        token: authOtp,
      })
      if (error) throw error
      toast.success('Welcome back!')
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleInlineResetPhone = () => {
    setAuthOtpSent(false)
    setAuthOtp('')
  }

  const handleGoogleSSO = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?next=/checkout${planId ? `%3Fplan%3D${planId}` : ''}` } })
      if (error) throw error
    } catch (err: any) { toast.error(err.message || 'Google authentication failed') }
  }

  const getSubtotal = () => {
    if (!selectedPlan) return totalPrice()
    let base = Number(selectedPlan.price)
    if (selectedPlan.slug === 'custom-pack') {
      let surcharge = 0
      categories.forEach(cat => {
        if (cat === 'Exotic Fruits') surcharge += 600
        else if (cat === 'Immunity Boosting Fruits') surcharge += 300
        else if (cat === 'High Protein Fruits') surcharge += 300
        else if (cat === 'Weight Loss Fruits') surcharge += 300
        else if (cat === 'Seasonal Fruits') surcharge += 200
      })
      base = 3000 + surcharge
    }
    if (portionAdjustment === 'reduced') {
      base -= 300
    }
    return base
  }

  const subtotal = getSubtotal()
  const promoDiscount = appliedPromo ? Math.round(subtotal * appliedPromo.discount) : 0
  const discountedSubtotal = subtotal - promoDiscount
  const gst = Math.round(discountedSubtotal * 0.05)
  const delivery = selectedPlan ? 0 : (discountedSubtotal >= 500 ? 0 : 49)
  const total = discountedSubtotal + delivery + gst

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan && items.length === 0) { toast.error('Your cart is empty!'); return }

    // COD flow — no payment gateway
    if (paymentMethod === 'cod') {
      setLoading(true)
      try {
        const verify = await fetch('/api/razorpay/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: `cod_${Date.now()}`,
            razorpay_payment_id: `cod_${Date.now()}`,
            razorpay_signature: 'cod',
            cartItems: selectedPlan ? [] : items,
            planId: selectedPlan?.id || null,
            planDurationDays: selectedPlan?.duration_days || null,
            address: form, total: total - gst, subtotal, delivery,
            userId: user?.id,
            paymentMethod: 'cod',
            startDate, timeSlot, carryForward,
            preferences: { likes, dislikes, deliverySlot: deliverySlotParam, categories, portionAdjustment }
          }),
        })
        const result = await verify.json()
        if (result.success) {
          if (!selectedPlan) clearCart()
          // Apply referral code if provided
          if (referralCode && user?.id) {
            await applyReferralCode(referralCode, user.id, result.orderId).catch(() => {})
          }
          // Send invoice email
          await fetch('/api/invoice/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: result.orderId, email: user?.email })
          })
          toast.success('Order placed! Invoice emailed to you 📧')
          router.push(`/invoice/${result.orderId}`)
        } else { toast.error(result.error || 'Failed to place order') }
      } catch (err: any) { toast.error(err.message || 'Something went wrong') }
      finally { setLoading(false) }
      return
    }

    setLoading(true)
    const isMockPayment = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'your_razorpay_key_id'

    try {
      if (isMockPayment) {
        toast.success('Processing mock payment...')
        const verify = await fetch('/api/razorpay/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: `mock_order_${Date.now()}`,
            razorpay_payment_id: `mock_payment_${Date.now()}`,
            razorpay_signature: `mock_sig_${Date.now()}`,
            cartItems: selectedPlan ? [] : items,
            planId: selectedPlan?.id || null,
            planDurationDays: selectedPlan?.duration_days || null,
            address: form, total, subtotal, delivery, userId: user?.id,
            paymentMethod, startDate, timeSlot, carryForward,
            preferences: { likes, dislikes, deliverySlot: deliverySlotParam, categories, portionAdjustment }
          }),
        })
        const result = await verify.json()
        if (result.success) {
          if (!selectedPlan) clearCart()
          await fetch('/api/invoice/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: result.orderId, email: user?.email })
          })
          toast.success(selectedPlan ? 'Subscription activated! Invoice emailed 📧' : 'Order placed! Invoice emailed 📧')
          router.push(`/invoice/${result.orderId}`)
        } else { toast.error(result.error || 'Payment verification failed') }
        setLoading(false); return
      }

      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay SDK failed to load')
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      })
      const { orderId: rzpOrderId, amount: rzpAmount, currency } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpAmount, currency,
        name: 'FruitDabba', description: selectedPlan ? `Subscription – ${selectedPlan.name}` : 'FruitDabba Order',
        order_id: rzpOrderId,
        prefill: { name: form.name, email: user?.email, contact: form.phone },
        theme: { color: '#22c55e' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              cartItems: selectedPlan ? [] : items,
              planId: selectedPlan?.id || null,
              planDurationDays: selectedPlan?.duration_days || null,
              address: form, total, subtotal, delivery, userId: user?.id,
              paymentMethod, startDate, timeSlot, carryForward,
              preferences: { likes, dislikes, deliverySlot: deliverySlotParam, categories, portionAdjustment }
            }),
          })
          const result = await verify.json()
          if (result.success) {
            if (!selectedPlan) clearCart()
            await fetch('/api/invoice/send', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: result.orderId, email: user?.email })
            })
            toast.success('Payment successful! Invoice emailed 📧')
            router.push(`/invoice/${result.orderId}`)
          } else { toast.error('Payment verification failed') }
        },
      }
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const updateForm = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (!authChecked || fetchingPlan) {
    return <div className="min-h-screen bg-cream flex items-center justify-center pt-16"><Loader2 className="animate-spin text-forest" size={32} /></div>
  }

  if (authNeeded) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8">
          <div className="bg-gradient-to-r from-forest to-forest-light p-8 text-white text-center">
            <div className="text-4xl mb-2">🍊</div>
            <h2 className="text-2xl font-bold">FruitDabba Checkout</h2>
            <p className="text-white/70 text-sm mt-1">Sign in to finalize your fresh subscription!</p>
          </div>
          <div className="p-8">
            <div className="flex bg-cream rounded-2xl p-1 mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button key={m} type="button" onClick={() => { setAuthMode(m); setAuthPhone(''); setAuthOtp(''); setAuthOtpSent(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${authMode === m ? 'bg-forest text-white shadow-md' : 'text-gray-550 hover:text-gray-700'}`}>
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Sub-tab for email vs mobile login */}
            {authMode === 'login' && (
              <div className="flex justify-center gap-6 mb-6 border-b border-gray-100 pb-3">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`text-xs font-extrabold pb-1.5 border-b-2 transition-all ${
                    authMethod === 'email'
                      ? 'border-forest text-forest font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  📧 Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('mobile')}
                  className={`text-xs font-extrabold pb-1.5 border-b-2 transition-all ${
                    authMethod === 'mobile'
                      ? 'border-forest text-forest font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  📱 Mobile Login (OTP)
                </button>
              </div>
            )}

            {authMode === 'login' && authMethod === 'mobile' ? (
              /* Phone OTP Login UI */
              !authOtpSent ? (
                <form onSubmit={handleInlineRequestOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-550 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                        className="input pl-11 py-2.5 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-550 mb-1.5 block">Mobile Number</label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-655">+91</span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        pattern="[0-9]{10}"
                        className="input pl-20 py-2.5 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authOtpLoading || authPhone.length !== 10 || !authName.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {authOtpLoading && <Loader2 size={16} className="animate-spin" />}
                    Send OTP Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleInlineVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-gray-550 block">Verification Code</label>
                      <button
                        type="button"
                        onClick={handleInlineResetPhone}
                        className="text-xs text-forest hover:underline font-bold cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        pattern="[0-9]{6}"
                        className="input pl-11 py-2.5 text-sm font-mono tracking-widest text-center"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                      Enter the code received via SMS (use **123456** in local testing).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || authOtp.length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading && <Loader2 size={16} className="animate-spin" />}
                    Verify & Sign In
                  </button>
                </form>
              )
            ) : (
              /* Email Auth Form */
              <form onSubmit={handleInlineAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div className="relative">
                    <input type="text" placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} required className="input pl-11 py-2.5 text-sm" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  <input type="email" placeholder="Email address" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="input pl-11 py-2.5 text-sm" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required minLength={6} className="input pl-11 pr-11 py-2.5 text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? '🙈' : '👁️'}</button>
                </div>
                <button type="submit" disabled={authLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
                  {authLoading && <Loader2 size={16} className="animate-spin" />}
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-gray-100" /><span className="text-gray-400 text-xs">or</span><div className="flex-1 h-px bg-gray-100" /></div>
            <button type="button" onClick={handleGoogleSSO} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google (Gmail)
            </button>
            <div className="mt-6 text-center"><Link href="/#plans" className="text-sm font-semibold text-forest hover:underline">← Continue Shopping</Link></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Step 1: Address */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 text-base mb-5 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#22c55e] text-white text-xs font-extrabold flex items-center justify-center">1</span>
                  <MapPin size={16} className="text-[#22c55e]" /> Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Full Name</label>
                    <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} required className="input text-sm" placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Phone Number</label>
                    <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} required className="input text-sm" placeholder="+91 98765 43210" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Flat / House no., Street, Area</label>
                    <input value={form.line1} onChange={(e) => updateForm('line1', e.target.value)} required className="input text-sm" placeholder="Flat / House No., Building, Street" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={form.line2} onChange={(e) => updateForm('line2', e.target.value)} className="input text-sm" placeholder="Area, Locality" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">City</label>
                    <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} required className="input text-sm" placeholder="Bangalore" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Pincode</label>
                    <input value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)} required className="input text-sm" placeholder="560001" pattern="[0-9]{6}" />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Schedule */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#22c55e] text-white text-xs font-extrabold flex items-center justify-center">2</span>
                  <Calendar size={16} className="text-[#22c55e]" /> Delivery Schedule
                </h2>
                <p className="text-xs text-gray-400 ml-10 mb-5">Pick when your {selectedPlan ? 'subscription' : 'order'} arrives</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Start Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={startDate}
                        min={minDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="input pl-9 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1.5 block">Preferred Time Slot</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="input pl-9 text-sm appearance-none pr-8"
                      >
                        {TIME_SLOTS.map(t => (
                          <option key={t.value} value={t.value}>{t.icon} {t.label} — {t.desc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Time slot pills for visual selection */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTimeSlot(t.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        timeSlot === t.value
                          ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setCarryForward(!carryForward)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      carryForward ? 'bg-[#22c55e] border-[#22c55e]' : 'border-gray-300'
                    }`}
                  >
                    {carryForward && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Carry forward to the next day if I'm unavailable
                  </span>
                </label>
              </div>

              {/* Step 2b: Referral Code */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#22c55e] text-white text-xs font-extrabold flex items-center justify-center">💚</span>
                  <Gift size={16} className="text-[#22c55e]" /> Have a Referral Code?
                </h2>
                <p className="text-xs text-gray-400 ml-10 mb-3">Enter a friend's code to get started (optional)</p>
                {user && (
                  <ReferralInput
                    userId={user.id}
                    onValid={(code) => setReferralCode(code)}
                    onClear={() => setReferralCode('')}
                  />
                )}
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 text-base mb-1 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#22c55e] text-white text-xs font-extrabold flex items-center justify-center">3</span>
                  <CreditCard size={16} className="text-[#22c55e]" /> Payment Method
                </h2>
                <p className="text-xs text-gray-400 ml-10 mb-5">Choose how you'd like to pay</p>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-[#22c55e] bg-[#22c55e]/5'
                          : 'border-gray-150 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-xl shrink-0`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{method.label}</div>
                        <div className="text-xs text-gray-500">{method.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        paymentMethod === method.id ? 'border-[#22c55e] bg-[#22c55e]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-3 flex flex-wrap gap-2 px-1">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(u => (
                      <span key={u} className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1">{u}</span>
                    ))}
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div className="mt-3 flex flex-wrap gap-2 px-1">
                    {['Visa', 'Mastercard', 'RuPay', 'Amex'].map(c => (
                      <span key={c} className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1">{c}</span>
                    ))}
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
                    <Truck size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">Pay ₹{total.toFixed(0)} in cash when your first box arrives. Please keep exact change ready.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm sticky top-28 overflow-hidden">
                {/* Green header */}
                <div className="bg-[#22c55e] px-5 py-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mb-0.5">Your Subscription</div>
                  <div className="text-white font-extrabold text-lg leading-tight">
                    {selectedPlan ? selectedPlan.name : 'Cart Items'}
                  </div>
                  {selectedPlan && (
                    <div className="text-white/80 text-sm font-semibold mt-0.5">
                      ₹{subtotal.toLocaleString()}/month
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Selected plan detail */}
                  {selectedPlan ? (
                    <div className="space-y-2">
                      {likes.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                            🍎 Your fruit selection
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {likes.map(l => (
                              <span key={l} className="text-xs font-semibold bg-[#22c55e]/10 text-[#22c55e] px-2 py-0.5 rounded-full border border-[#22c55e]/20">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {categories.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">Category:</span> {categories.join(', ')}
                        </div>
                      )}
                      {portionAdjustment === 'reduced' && (
                        <div className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200/50 rounded-xl px-3 py-1.5 mt-2 flex items-center gap-1.5 animate-pulse">
                          ⚖️ Reduced Portion (-50g to -70g per box)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate max-w-[160px]">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delivery info */}
                  {startDate && (
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1 border border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Starts:</span>
                        <span className="font-semibold">{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Slot:</span>
                        <span className="font-semibold">{TIME_SLOTS.find(t => t.value === timeSlot)?.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Promo Code */}
                  <div className="border-t border-gray-100 pt-3">
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <div>
                          <div className="text-xs font-extrabold text-green-700">🎉 {appliedPromo.code}</div>
                          <div className="text-[10px] text-green-600">{appliedPromo.label} applied!</div>
                        </div>
                        <button type="button" onClick={handleRemovePromo} className="text-[10px] text-red-400 hover:text-red-600 font-bold underline cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Promo Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
                            placeholder="e.g. FIRSTBOX30"
                            className="input text-xs py-2 flex-1 uppercase tracking-widest font-bold"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-3 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && <p className="text-[10px] text-red-500 font-semibold">{promoError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subscription</span><span>₹{(subtotal + (portionAdjustment === 'reduced' ? 300 : 0)).toLocaleString()}</span>
                    </div>
                    {portionAdjustment === 'reduced' && (
                      <div className="flex justify-between text-amber-600 font-bold">
                        <span>Portion Discount</span><span>-₹300</span>
                      </div>
                    )}
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Promo ({appliedPromo.code})</span>
                        <span>-₹{promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className={delivery === 0 ? 'text-[#22c55e] font-semibold' : ''}>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST (5%)</span><span>₹{gst}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <div className="text-right">
                        {appliedPromo && (
                          <div className="text-xs text-gray-400 line-through">₹{(subtotal + delivery + Math.round(subtotal * 0.05)).toLocaleString()}</div>
                        )}
                        <span className="text-[#22c55e]">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedPlan && (
                      <p className="text-[10px] text-gray-400">Billed per month · cancel anytime</p>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    id="pay-now-btn"
                    type="submit"
                    disabled={loading || (!selectedPlan && items.length === 0)}
                    className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-green-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-2xl transition-all text-sm shadow-sm"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    ) : (
                      <>Place subscription · ₹{total.toLocaleString()}{appliedPromo ? ' 🎉' : ''} →</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                    <span>📧</span> Invoice emailed instantly on payment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
