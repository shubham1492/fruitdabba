'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Copy, CheckCircle2, Users, Star } from 'lucide-react'
import { getOrCreateReferralCode, getUserReferrals, getUserRewards, ReferralCode } from '@/lib/referral'
import toast from 'react-hot-toast'

interface ReferralDashboardProps {
  userId: string
  userName?: string
}

export default function ReferralDashboard({ userId, userName }: ReferralDashboardProps) {
  const [myCode, setMyCode] = useState<ReferralCode | null>(null)
  const [referrals, setReferrals] = useState<ReferralCode[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [code, refs, rwds] = await Promise.all([
        getOrCreateReferralCode(userId),
        getUserReferrals(userId),
        getUserRewards(userId),
      ])
      setMyCode(code)
      setReferrals(refs)
      setRewards(rwds)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const copyCode = () => {
    if (!myCode) return
    const shareText = `Hey! Use my FruitDabba referral code ${myCode.code} to get started — you'll love fresh daily deliveries 🍎. Sign up at fruitdabba.com`
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const usedReferrals = referrals.filter((r) => r.status === 'used')

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* My referral code card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16a34a] via-[#22c55e] to-[#4ade80] p-6 text-white shadow-xl">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-white/80 text-xs font-bold uppercase tracking-widest">
            <Gift size={13} /> Your Referral Code
          </div>
          <div className="text-4xl font-black tracking-widest font-mono mb-1">
            {myCode?.code || '—'}
          </div>
          <p className="text-white/70 text-sm mb-4">
            Share this code with friends. When they subscribe, you both get rewarded 🎁
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy & Share'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hey! Use my FruitDabba referral code ${myCode?.code} to get started 🍎 — sign up at fruitdabba.com`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
            >
              📱 Share on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Referrals', value: referrals.length, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Successful', value: usedReferrals.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Free Boxes Earned', value: rewards.length, icon: '🎁', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 font-semibold mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
        <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
          <Star size={14} className="text-[#22c55e]" /> How Referrals Work
        </h4>
        {[
          { step: '1', text: 'Share your unique code with a friend' },
          { step: '2', text: 'They enter your code when subscribing' },
          { step: '3', text: 'Once their first order is paid, you both win 🎉' },
          { step: '4', text: 'You get 1 free box credited to your account' },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-3 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full bg-[#22c55e] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {item.step}
            </span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Rewards */}
      {rewards.length > 0 && (
        <div>
          <h4 className="font-extrabold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Gift size={14} className="text-[#22c55e]" /> Your Rewards
          </h4>
          <div className="space-y-2">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
              >
                <div>
                  <div className="text-sm font-bold text-green-700">{r.description}</div>
                  <div className="text-xs text-green-600">
                    Expires {new Date(r.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-green-600 text-white px-2.5 py-1 rounded-full">
                  AVAILABLE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral history */}
      {referrals.length > 0 && (
        <div>
          <h4 className="font-extrabold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Users size={14} className="text-gray-600" /> Referral History
          </h4>
          <div className="space-y-2">
            {referrals.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-semibold text-gray-700">
                    {r.status === 'used' ? '✅ Friend subscribed!' : '⏳ Waiting for friend to subscribe'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    r.status === 'used'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {r.status === 'used' ? 'Rewarded' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">👋</div>
          <p className="text-sm font-semibold">No referrals yet</p>
          <p className="text-xs mt-1">Share your code above to start earning free boxes!</p>
        </div>
      )}
    </div>
  )
}
