'use client'

import { useEffect } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart'
import { useUIStore } from '@/lib/stores/ui'
import { createClient } from '@/lib/supabase/client'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const supabase = createClient()
  const openAuthModal = useUIStore((state) => state.openAuthModal)

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      closeCart()
      router.push('/checkout')
    } else {
      openAuthModal('/checkout')
    }
  }

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const price = totalPrice()
  const deliveryFee = price > 500 ? 0 : 49
  const total = price + deliveryFee

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        id="cart-drawer"
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-forest" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Your Cart</h2>
              <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="text-6xl">🛒</div>
              <h3 className="font-semibold text-gray-700">Your cart is empty</h3>
              <p className="text-sm text-gray-500">Add some fresh fruits to get started!</p>
              <button
                onClick={closeCart}
                className="btn-primary mt-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-cream rounded-2xl group">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span>🍎</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-forest transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-forest text-white flex items-center justify-center hover:bg-forest-light transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Price */}
                      <span className="font-bold text-forest text-sm">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 ml-auto"
              >
                <Trash2 size={12} /> Clear cart
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4 bg-white">
            {/* Delivery */}
            {deliveryFee === 0 ? (
              <div className="flex items-center gap-2 bg-forest/10 text-forest text-sm font-medium px-4 py-2.5 rounded-xl">
                <span>🎉</span> Free delivery on this order!
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                Add ₹{(500 - price).toFixed(0)} more for free delivery
              </p>
            )}

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{price.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-forest">₹{total.toFixed(0)}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckoutClick}
              className="btn-primary w-full flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
