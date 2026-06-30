'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, Smartphone, Phone, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('') // For either email or phone in login
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.trim().length < 2) {
      toast.error('Please enter your full name')
      return
    }
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    setOtpLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
        options: { data: { full_name: name } }
      })
      if (error) throw error
      setOtpSent(true)
      toast.success('OTP sent successfully!')
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
      const { error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
      })
      if (error) throw error
      toast.success('Successfully signed in!')
      router.push(redirectPath)
      router.refresh()
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          toast.error('Please enter your full name')
          setLoading(false)
          return
        }
        if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
          toast.error('Please enter a valid 10-digit phone number')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            }
          },
        })
        if (error) throw error

        // Also upsert profile row for real db configurations
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const isRealSupabase = url && url.startsWith('http')
        if (isRealSupabase && data?.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: name,
              email: email,
              phone: phone,
              role: 'customer',
            })
          } catch (err) {
            console.error('Failed to create real db profile on register:', err)
          }
        }

        toast.success('Registration successful! Please sign in.')
        setMode('login')
        setIdentifier(email)
      } else {
        let loginEmail = identifier.trim()
        const isEmail = loginEmail.includes('@')

        if (!isEmail) {
          const cleanPhoneInput = loginEmail.replace(/\D/g, '')
          if (cleanPhoneInput.length < 10) {
            throw new Error('Please enter a valid email or 10-digit phone number')
          }

          const { data: profiles, error: pError } = await supabase
            .from('profiles')
            .select('email, phone')

          if (pError) throw pError

          const matched = profiles?.find((p: any) => {
            if (!p.phone) return false
            const dbClean = p.phone.replace(/\D/g, '')
            return dbClean.endsWith(cleanPhoneInput) || cleanPhoneInput.endsWith(dbClean)
          })

          if (!matched || !matched.email) {
            throw new Error('No account found with this phone number. Please register!')
          }
          loginEmail = matched.email
        }

        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push(redirectPath)
        router.refresh()
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 text-6xl opacity-20 animate-float">🍊</div>
        <div className="absolute bottom-20 left-10 text-5xl opacity-20 animate-float-delay">🍎</div>
        <div className="absolute top-1/2 right-20 text-4xl opacity-15 animate-float-delay-2">🥭</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top banner (made more compact) */}
          <div className="bg-gradient-to-r from-forest to-forest-light p-5 text-white text-center">
            <div className="text-2xl mb-1">🍊</div>
            <h1 className="text-xl font-bold">FruitDabba</h1>
            <p className="text-white/70 text-xs mt-0.5">
              {mode === 'login' ? 'Welcome back!' : 'Join thousands of fruit lovers'}
            </p>
          </div>

          <div className="p-6">
            {/* Tab Toggle */}
            <div className="flex bg-cream rounded-2xl p-1 mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    mode === m
                      ? 'bg-forest text-white shadow-md'
                      : 'text-gray-550 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {mode === 'login' ? (
              /* Sign In Form: Email or Phone + Password */
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    id="identifier-input"
                    type="text"
                    placeholder="Email or Phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="input pl-11 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-11 pr-11 py-2.5 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer py-2.5"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Sign In
                </button>
              </form>
            ) : (
              /* Sign Up Form: Name, Email, Phone, Password */
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input pl-11 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    pattern="[0-9]{10}"
                    className="input pl-11 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input pl-11 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input pl-11 pr-11 py-2.5 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer py-2.5"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Create Account
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              id="google-auth-btn"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-forest font-semibold hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-4">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-white/70 hover:text-white">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
