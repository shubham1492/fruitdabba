export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Notifications — Admin' }

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('notifications_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Notifications</h1>
        <p className="text-gray-500 text-sm">Last {logs?.length || 0} messages</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Order</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {!logs || logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No notifications sent yet</td></tr>
            ) : (logs as any[]).map((log: any) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full capitalize">
                    {log.message_type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                  {log.order_id ? `#${log.order_id.slice(0, 8).toUpperCase()}` : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    log.status === 'sent' ? 'bg-green-100 text-green-700' :
                    log.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(log.created_at), 'dd MMM, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
