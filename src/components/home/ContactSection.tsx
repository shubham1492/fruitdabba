'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      toast.success('Thank you for your message! We will get back to you shortly.')
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: ''
      })
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  return (
    <section id="contact" className="bg-secondary/40 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 mx-auto items-center text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Contact
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Let’s get fresh fruit to your door
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Have a question or ready to subscribe? Send us a message and we’ll get right back to you.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* Left Column: Contact details */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Prefer chatting directly? Reach out on WhatsApp for the fastest response — our team is happy to help you choose the perfect plan.
            </p>
            
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="size-5" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Call us</span>
                  <span className="block font-semibold text-gray-900">+91 95955 79336</span>
                </span>
              </li>
              
              <li className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Email us</span>
                  <span className="block font-semibold text-gray-900">hello@fruitdabba.com</span>
                </span>
              </li>

              <li className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </span>
                <span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Serving</span>
                  <span className="block font-semibold text-gray-900">All major metro cities</span>
                </span>
              </li>
            </ul>

            <a
              href="https://wa.me/919595579336?text=Hi%20FruitDabba!%20I'd%20like%20to%20know%20more%20about%20your%20subscriptions."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-semibold transition-all h-12 bg-[#25D366] text-white hover:bg-[#1ebe5b] hover:shadow-lg gap-2 px-6"
            >
              <MessageCircle className="size-5 fill-white text-[#25D366]" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Right Column: Contact form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-6 sm:p-8 lg:col-span-3 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input h-10"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 95955 79336"
                  className="input h-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input h-10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us which plan you’re interested in…"
                className="input py-3 min-h-24 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-semibold transition-all h-12 bg-primary text-white hover:bg-primary/95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed gap-2 px-6 mt-2 cursor-pointer"
            >
              <Send className="size-4" />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
