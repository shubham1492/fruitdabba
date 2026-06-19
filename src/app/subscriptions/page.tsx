export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import SubscriptionCTA from '@/components/home/SubscriptionCTA'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose a fresh fruit subscription plan and save up to 15% on every delivery.',
}

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('duration_days')

  return (
    <div className="min-h-screen bg-cream pt-24">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-forest-dark to-forest text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-sm font-bold text-orange uppercase tracking-widest">Save More</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Fresh Fruits, <span className="text-orange">Your Way</span>
          </h1>
          <p className="text-white/70 text-lg mt-4 max-w-xl mx-auto">
            Subscribe to your perfect fruit plan and enjoy farm-fresh fruits delivered regularly.
            Cancel or change anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <SubscriptionCTA plans={plans ?? []} />

      {/* FAQ */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Can I cancel anytime?', a: 'Yes! You can pause or cancel your subscription at any time from your dashboard. No questions asked.' },
                { q: 'How is delivery scheduled?', a: 'After checkout, you\'ll choose your preferred delivery days. We deliver 7 days a week.' },
                { q: 'What if I receive damaged fruits?', a: 'We have a 100% freshness guarantee. Contact us via WhatsApp and we\'ll replace or refund immediately.' },
                { q: 'Can I change my plan?', a: 'Absolutely! You can upgrade, downgrade, or switch plans from your profile at any time.' },
              ].map((faq, i) => (
                <details key={i} className="card p-5 bg-white border border-gray-150 group cursor-pointer">
                  <summary className="font-semibold text-gray-900 flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
