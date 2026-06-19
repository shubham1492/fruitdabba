'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, User, Phone, Save, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReferralDashboard from '@/components/referral/ReferralDashboard'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', phone: '' })
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'referral'>('profile')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '' })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id)
    if (error) toast.error(error.message)
    else toast.success('Profile updated!')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-forest" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar & Quick Links */}
          <div className="space-y-4">
            <div className="card p-6 text-center">
              <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <User size={32} className="text-forest" />
              </div>
              <h2 className="font-bold text-gray-900">{profile.full_name || 'User'}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{email}</p>
            </div>
            <div className="card p-4 space-y-2">
              <Link href="/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-cream hover:text-forest transition-colors">
                📦 My Orders
              </Link>
              <Link href="/subscriptions" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-cream hover:text-forest transition-colors">
                🔄 Subscriptions
              </Link>
              <button
                onClick={() => setActiveTab('referral')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'referral' ? 'bg-green-50 text-forest font-bold' : 'text-gray-700 hover:bg-cream hover:text-forest'
                }`}
              >
                <Gift size={14} /> Refer & Earn
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="md:col-span-2">
            <div className="flex gap-1 mb-4 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
              {(['profile', 'referral'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab ? 'bg-[#22c55e] text-white shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'profile' ? <><User size={14} /> My Profile</> : <><Gift size={14} /> Refer & Earn</>}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User size={14} className="inline mr-1.5" />Full Name
                  </label>
                  <input
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    className="input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input value={email} disabled className="input opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone size={14} className="inline mr-1.5" />Phone Number
                  </label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="input"
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used for WhatsApp delivery notifications</p>
                </div>
                <button type="submit" id="save-profile-btn" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </form>
            )}

            {activeTab === 'referral' && userId && (
              <div className="card p-6">
                <ReferralDashboard userId={userId} userName={profile.full_name} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
