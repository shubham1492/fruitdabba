'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqItems = [
  {
    question: 'How does the daily subscription work?',
    answer: 'FruitDabba delivers your chosen daily portion pack (Basic, Mini, Medium, or Premium Pack) directly to your doorstep every morning. Subscriptions cover exactly 26 delivery days in a 30-day period.',
  },
  {
    question: 'What is the "Sunday Holiday"?',
    answer: 'We do not deliver on Sundays. This allows our delivery partners to rest and lets you enjoy eating out or cheat meals. Your subscription is for 26 delivery days (Monday through Saturday).',
  },
  {
    question: 'What is the carry-forward policy?',
    answer: 'If you are travelling or unable to receive a delivery, let us know via WhatsApp or pause in your dashboard. Any undelivered packs will be carried forward to extend your subscription validity.',
  },
  {
    question: 'How are fruits, legumes, and nuts curated?',
    answer: 'Our Basic and Mini packs feature a minimum of 4-5 seasonal fruits. The Medium pack adds nutrient-rich legumes, and the Premium pack includes legumes plus premium nuts and dry fruits for complete daily nutrition.',
  },
  {
    question: 'Is delivery free in Bangalore?',
    answer: 'Yes! Daily doorstep delivery is completely free across Bangalore. Surcharges for tier-1 city cold-chain logistics are already pre-included in the final plan prices.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Questions? We’ve got answers
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything you need to know about delivery, subscriptions, freshness, and payments.
          </p>
        </div>

        <div className="flex flex-col mt-10 w-full space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl border bg-card px-5 transition-all duration-200 ${
                  isOpen ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-gray-300'
                }`}
              >
                <h3>
                  <button
                    onClick={() => toggleFAQ(idx)}
                    type="button"
                    className="flex flex-1 w-full items-start justify-between py-5 text-left font-heading text-base font-semibold text-gray-900 hover:no-underline cursor-pointer"
                  >
                    {item.question}
                    {isOpen ? (
                      <ChevronUp className="shrink-0 size-5 text-primary" />
                    ) : (
                      <ChevronDown className="shrink-0 size-5 text-muted-foreground" />
                    )}
                  </button>
                </h3>
                
                {isOpen && (
                  <div className="pb-5 text-sm leading-relaxed text-muted-foreground animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
