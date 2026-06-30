'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/lib/stores/ui'
import { Mail, Lock, Eye, EyeOff, Loader2, X, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { isAuthModalOpen, authRedirectUrl, closeAuthModal } = useUIStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Reset states on close/open
  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('')
      setPassword('')
      setName('')
      setPhone('')
      setOtp('')
      setOtpSent(false)
      setLoginMethod('email')
      setLoading(false)
    }
  }, [isAuthModalOpen])

  // Prevent background scroll when open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const needsName = loginMethod === 'mobile' || mode === 'register'
    if (needsName && (!name || name.trim().length < 2)) {
      toast.error('Please enter your full name')
      return
    }

    if (loginMethod === 'mobile') {
      if (!phone || phone.length < 10) {
        toast.error('Please enter a valid 10-digit mobile number')
        return
      }
    } else {
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address')
        return
      }
    }

    setOtpLoading(true)
    try {
      const signInParams: any = {
        options: {
          data: {}
        }
      }
      if (needsName) {
        signInParams.options.data.full_name = name
      }
      
      if (loginMethod === 'mobile') {
        signInParams.phone = `+91${phone}`
      } else {
        signInParams.email = email
        signInParams.options.emailRedirectTo = `${window.location.origin}/auth/callback`
      }

      const { error } = await supabase.auth.signInWithOtp(signInParams)
      if (error) throw error
      setOtpSent(true)
      toast.success('OTP code sent successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      toast.error('Please enter a 6-digit OTP code')
      return
    }
    setLoading(true)
    try {
      const verifyParams: any = {
        token: otp,
      }
      if (loginMethod === 'mobile') {
        verifyParams.phone = `+91${phone}`
        verifyParams.type = 'sms'
      } else {
        verifyParams.email = email
        verifyParams.type = 'email'
      }

      const { error } = await supabase.auth.verifyOtp(verifyParams)
      if (error) throw error
      toast.success('Successfully signed in!')
      closeAuthModal()
      router.refresh()
      if (authRedirectUrl) {
        router.push(authRedirectUrl)
      }
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPhone = () => {
    setOtpSent(false)
    setOtp('')
  }

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${authRedirectUrl || '/'}`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in border border-gray-100">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-forest to-forest-light p-8 text-white text-center relative">
          <div className="text-4xl mb-2">🍊</div>
          <h2 className="text-2xl font-bold">FruitDabba</h2>
          <p className="text-white/70 text-sm mt-1">
            {mode === 'login' ? 'Sign in to complete your checkout!' : 'Join us for fresh fruit boxes!'}
          </p>
        </div>

        {/* Form area */}
        <div className="p-8">
          {/* Tab Selector */}
          <div className="flex bg-cream rounded-2xl p-1 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setOtpSent(false); setOtp(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-forest text-white shadow-md'
                    : 'text-gray-550 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Sub-tab for email vs mobile */}
          <div className="flex justify-center gap-6 mb-6 border-b border-gray-100 pb-3">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setOtpSent(false); setOtp(''); }}
              className={`text-xs font-extrabold pb-1.5 border-b-2 transition-all ${
                loginMethod === 'email'
                  ? 'border-forest text-forest font-extrabold'
                  : 'border-transparent text-gray-450 hover:text-gray-650'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('mobile'); setOtpSent(false); setOtp(''); }}
              className={`text-xs font-extrabold pb-1.5 border-b-2 transition-all ${
                loginMethod === 'mobile'
                  ? 'border-forest text-forest font-extrabold'
                  : 'border-transparent text-gray-450 hover:text-gray-650'
              }`}
            >
              📱 Mobile
            </button>
          </div>

          {otpSent ? (
            /* OTP Verification UI (Shared) */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-555 block">Verification Code</label>
                  <button
                    type="button"
                    onClick={handleResetPhone}
                    className="text-xs text-forest hover:underline font-bold cursor-pointer"
                  >
                    Change {loginMethod === 'email' ? 'Email' : 'Number'}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    pattern="[0-9]{6}"
                    className="input pl-11 py-2.5 text-sm font-mono tracking-widest text-center"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Enter the code received via {loginMethod === 'email' ? 'email' : 'SMS'} (check browser toast notifications in local dev).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Verify & Sign In
              </button>
            </form>
          ) : (
            /* OTP Request UI */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {(loginMethod === 'mobile' || mode === 'register') && (
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input pl-11 py-2.5 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {loginMethod === 'mobile' ? (
                <div>
                  <label className="text-xs font-bold text-gray-550 mb-1.5 block">Mobile Number</label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">+91</span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      pattern="[0-9]{10}"
                      className="input pl-20 py-2.5 text-sm font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-550 mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input pl-11 py-2.5 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  otpLoading || 
                  (loginMethod === 'mobile' && (phone.length !== 10 || !name.trim())) ||
                  (loginMethod === 'email' && (!email.trim() || (mode === 'register' && !name.trim())))
                }
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 cursor-pointer disabled:opacity-50"
              >
                {otpLoading && <Loader2 size={16} className="animate-spin" />}
                Send OTP Code
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google SSO */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google (Gmail)
          </button>
        </div>
      </div>
    </div>
  )
}
