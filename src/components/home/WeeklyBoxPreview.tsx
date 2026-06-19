'use client'

import Image from 'next/image'
import { Leaf } from 'lucide-react'

const previewItems = [
  {
    name: 'Alphonso Mango',
    season: 'Summer Season',
    description: 'Rich in Vitamin A & antioxidants for healthy skin and eyes.',
    image: '/images/fruit-mango.png',
  },
  {
    name: 'Mixed Berries',
    season: 'Year Round',
    description: 'Packed with antioxidants and fibre to boost immunity.',
    image: '/images/fruit-berries.png',
  },
  {
    name: 'Citrus Oranges',
    season: 'Winter Season',
    description: 'Loaded with Vitamin C to keep colds and fatigue away.',
    image: '/images/fruit-citrus.png',
  },
  {
    name: 'Tropical Mix',
    season: 'Seasonal Picks',
    description: 'Kiwi, pineapple & dragon fruit for digestion and energy.',
    image: '/images/fruit-tropical.png',
  },
]

export default function WeeklyBoxPreview() {
  return (
    <section id="fruit-box" className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            This Week's Box
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A peek inside your weekly fruit box
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Every box is curated with seasonal, handpicked fruits — bursting with flavour and nutrition.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {previewItems.map((item, idx) => (
            <div key={idx} className="fd-reveal h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
                  <Image
                    alt={`Fresh ${item.name}`}
                    src={item.image}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, (max-w-1024px) 50vw, 25vw"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-sm">
                    {item.season}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <Leaf className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item.description}</span>
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
