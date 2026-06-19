'use client'

import { useCartStore } from '@/lib/stores/cart'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const subtotal = totalPrice()
  const delivery = subtotal >= 500 || subtotal === 0 ? 0 : 49
  const total = subtotal + delivery
  
  const router = useRouter()
  const openAuthModal = useUIStore((s) => s.openAuthModal)
  const supabase = createClient()

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/checkout')
    } else {
      openAuthModal('/checkout')
    }
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart {items.length > 0 && `(${items.length})`}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
            <p className="text-gray-400 mt-2 mb-8">Add some fresh fruits to get started!</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={18} /> Browse Fruits
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card flex gap-5 p-5">
                  <div className="w-20 h-20 bg-cream rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : '🍎'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.unit}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-forest transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-gray-900 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center hover:bg-forest-light transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-forest text-lg">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <Trash2 size={14} /> Clear cart
                </button>
                <Link href="/products" className="text-sm text-forest font-semibold hover:underline">
                  ← Continue shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-28">
                <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                      {delivery === 0 ? 'FREE' : `₹${delivery}`}
                    </span>
                  </div>
                  {delivery > 0 && (
                    <p className="text-xs text-gray-400">
                      Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
                    </p>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-forest">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                {delivery === 0 && subtotal > 0 && (
                  <div className="mt-4 bg-forest/10 text-forest text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2">
                    🎉 You qualify for free delivery!
                  </div>
                )}

                <button
                  onClick={handleCheckoutClick}
                  id="proceed-checkout-btn"
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                {/* Payment icons */}
                <div className="flex items-center justify-center gap-3 mt-5 text-xs text-gray-400">
                  <span>Secure payment via</span>
                  <span className="font-bold text-gray-600">Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
