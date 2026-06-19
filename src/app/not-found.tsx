import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🍎</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">404 — Not Found</h1>
        <p className="text-gray-500 text-lg mb-8">
          Oops! This page seems to have gone missing, just like the last mango of the season.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">← Back to Home</Link>
          <Link href="/products" className="btn-outline">Browse Fruits</Link>
        </div>
      </div>
    </div>
  )
}
