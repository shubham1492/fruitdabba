'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'

const promiseItems = [
  {
    title: 'FSSAI certified & food-safe',
    description: 'Every box is packed in hygienic, FSSAI-licensed facilities with strict food-safety standards.',
  },
  {
    title: 'Cold-chain freshness',
    description: 'Temperature-controlled storage and transport keep your fruit crisp from farm to doorstep.',
  },
  {
    title: 'Direct-from-farm sourcing',
    description: 'We partner directly with vetted farms, cutting middlemen for fresher fruit and fairer prices.',
  },
  {
    title: '100% freshness guarantee',
    description: 'Not happy with a fruit? We replace it free, no questions asked, on your very next delivery.',
  },
]

export default function QualityPromise() {
  return (
    <section id="quality" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left column: Image */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-[90%] w-[90%] rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-accent/15 blur-sm"></div>
          
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl relative aspect-[720/620] w-full">
            <Image
              alt="A farmer holding freshly harvested fruit at an orchard"
              src="/images/quality-sourcing.png"
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 50vw"
            />
          </div>
          
          {/* Badge Overlay */}
          <div className="absolute -bottom-5 right-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-lg sm:right-8">
            <p className="font-heading text-2xl font-extrabold text-primary">100%</p>
            <p className="text-xs font-medium text-muted-foreground">Freshness guarantee</p>
          </div>
        </div>

        {/* Right column: Content */}
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Our Quality Promise
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Premium fruit, held to a higher standard
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            From farm partnerships to cold-chain delivery, every step is built to protect freshness, safety, and trust — so you get fruit that's genuinely worth subscribing to.
          </p>
          
          <ul className="mt-8 flex flex-col gap-5">
            {promiseItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 transition-all duration-300 hover:translate-x-1">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Check className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
