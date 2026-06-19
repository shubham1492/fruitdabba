'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-md">
                🍊
              </span>
              <span className="font-heading text-xl font-extrabold tracking-tight text-gray-900">
                Fruit<span className="text-primary">Dabba</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Fresh, handpicked seasonal fruits delivered to your doorstep on weekly and monthly subscriptions. Healthy living, made simple.
            </p>
            
            {/* Social Icons using inline SVGs */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"></circle>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M22 8.6a2.8 2.8 0 0 0-2-2C18.3 6.2 12 6.2 12 6.2s-6.3 0-8 .4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.7 12 29 29 0 0 0 2 15.4a2.8 2.8 0 0 0 2 2c1.7.4 8 .4 8 .4s6.3 0 8-.4a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .3-3.4 29 29 0 0 0-.3-3.4z"></path>
                  <path d="m10 15 5-3-5-3z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Links: Company */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-900">Company</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/#why-us" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Why FruitDabba
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Subscriptions */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-900">Subscriptions</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/#plans" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Weekly Dabba
                </Link>
              </li>
              <li>
                <Link href="/#plans" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Monthly Dabba
                </Link>
              </li>
              <li>
                <Link href="/#plans" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Quarterly Dabba
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-gray-900">Support</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/#faq" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#fruit-box" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Weekly Box
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FruitDabba. All rights reserved.
          </p>
          <a
            href="https://wa.me/919595579336?text=Hi%20FruitDabba!"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Order on WhatsApp →
          </a>
        </div>
      </div>
    </footer>
  )
}
