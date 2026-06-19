'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Gift, Search, Download, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ReferralRow {
  id: string
  code: string
  creator_user_id: string
  creator_email?: string
  used_by_user_id?: string
  used_by_email?: string
  status: string
  reward_credited: boolean
  created_at: string
  used_at?: string
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, used: 0, rewards: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      const rows = (data || []) as ReferralRow[]
      setReferrals(rows)
      setStats({
        total: rows.length,
        used: rows.filter((r) => r.status === 'used').length,
        rewards: rows.filter((r) => r.reward_credited).length,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = referrals.filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      (r.creator_email || '').toLowerCase().includes(search.toLowerCase())
  )

  const exportCsv = () => {
    const header = 'Code,Status,Reward Credited,Created At,Used At\n'
    const rows = filtered
      .map((r) => `${r.code},${r.status},${r.reward_credited},${r.created_at},${r.used_at || ''}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fruitdabba-referrals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Gift className="text-[#22c55e]" size={22} /> Referral Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track referral codes and rewards</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22c55e] text-white text-sm font-bold hover:bg-green-600 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Codes', value: stats.total, icon: '📋', color: 'bg-blue-50 text-blue-700' },
          { label: 'Successful Referrals', value: stats.used, icon: '✅', color: 'bg-green-50 text-green-700' },
          { label: 'Rewards Credited', value: stats.rewards, icon: '🎁', color: 'bg-orange-50 text-orange-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm font-semibold opacity-75 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by code or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#22c55e]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Code', 'Status', 'Reward Credited', 'Created', 'Used'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    No referrals found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800 tracking-widest">{r.code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          r.status === 'used'
                            ? 'bg-green-100 text-green-700'
                            : r.status === 'expired'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.reward_credited ? (
                        <span className="text-green-600 font-bold">✅ Yes</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.used_at
                        ? new Date(r.used_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
