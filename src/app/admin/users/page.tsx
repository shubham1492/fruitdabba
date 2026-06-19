export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Users — Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  // Use simple select \u2013 relational count (orders(count)) not supported in mock mode
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm">{users?.length || 0} registered users</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Joined</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Orders</th>
            </tr>
          </thead>
          <tbody>
            {!users || users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users yet</td></tr>
            ) : (users as any[]).map((user: any) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-forest/10 rounded-full flex items-center justify-center text-forest font-bold text-sm">
                      {user.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.full_name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(user.created_at), 'dd MMM yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="text-gray-400">—</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
