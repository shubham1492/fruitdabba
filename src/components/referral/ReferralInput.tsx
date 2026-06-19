'use client'

import { useState } from 'react'
import { Gift, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { validateReferralCode } from '@/lib/referral'

interface ReferralInputProps {
  userId: string
  onValid?: (code: string) => void
  onClear?: () => void
}

export default function ReferralInput({ userId, onValid, onClear }: ReferralInputProps) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [message, setMessage] = useState('')

  const handleApply = async () => {
    if (!code.trim()) return
    setStatus('loading')
    setMessage('')

    const result = await validateReferralCode(code.trim().toUpperCase(), userId)

    if (result.valid) {
      setStatus('valid')
      setMessage('🎉 Referral code applied! Your friend gets a free box.')
      onValid?.(code.trim().toUpperCase())
    } else {
      setStatus('invalid')
      setMessage(result.error || 'Invalid code')
    }
  }

  const handleClear = () => {
    setCode('')
    setStatus('idle')
    setMessage('')
    onClear?.()
  }

  return (
    <div className="mt-1">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Gift
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Referral code (e.g. FD-X7K2PM)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              if (status !== 'idle') { setStatus('idle'); setMessage('') }
            }}
            disabled={status === 'valid'}
            maxLength={10}
            className={`input pl-9 text-sm uppercase tracking-widest font-mono ${
              status === 'valid'
                ? 'border-green-400 bg-green-50 text-green-700'
                : status === 'invalid'
                ? 'border-red-300 bg-red-50'
                : ''
            }`}
          />
        </div>

        {status === 'valid' ? (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 rounded-xl border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={!code.trim() || status === 'loading'}
            className="px-4 py-2 rounded-xl bg-[#22c55e] text-white text-xs font-extrabold hover:bg-green-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {status === 'loading' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : null}
            Apply
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
            status === 'valid' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {status === 'valid' ? (
            <CheckCircle2 size={13} />
          ) : (
            <XCircle size={13} />
          )}
          {message}
        </div>
      )}
    </div>
  )
}
