'use client'

import { Sprout, Handshake, SlidersHorizontal, Wallet, BadgeCheck, Zap } from 'lucide-react'

const features = [
  {
    icon: Sprout,
    title: 'Farm Fresh Fruits',
    description: 'Sourced directly from trusted farms and harvested at peak ripeness.',
  },
  {
    icon: Handshake,
    title: 'No Middlemen',
    description: 'We cut out the layers so you get better quality at fairer prices.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Flexible Plans',
    description: 'Pause, skip, upgrade, or cancel your subscription anytime.',
  },
  {
    icon: Wallet,
    title: 'Affordable Pricing',
    description: 'Premium fruit boxes that fit comfortably within your budget.',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Checked',
    description: 'Every fruit is inspected and hand-graded before it’s packed.',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Reliable doorstep delivery so your fruit always arrives fresh.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="why-us" className="bg-secondary/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Why Choose FruitDabba
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Quality you can taste, service you can trust
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            We obsess over freshness, fairness, and reliability so you can simply enjoy great fruit.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="fd-reveal">
                <div className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-gray-900">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
