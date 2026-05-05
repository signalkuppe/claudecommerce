'use client'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useEffect, useState } from 'react'

export default function CartBadge() {
  const totalItems = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const notification = useCart((s) => s.notification)
  const clearNotification = useCart((s) => s.clearNotification)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!notification) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(clearNotification, 200)
    }, 3000)
    return () => clearTimeout(t)
  }, [notification, clearNotification])

  const optionLine = notification
    ? Object.entries(notification.options)
        .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
        .join(' · ')
    : ''

  return (
    <div className="relative">
      <Link
        href="/cart"
        className="relative inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        {mounted && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Link>

      {mounted && notification && (
        <div
          className={`absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 transition-all duration-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}
        >
          {/* arrow */}
          <div className="absolute -top-1.5 right-3 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
          <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added to cart
          </p>
          <p className="text-sm font-medium text-gray-900 leading-snug">{notification.name}</p>
          {optionLine && <p className="text-xs text-gray-400 mt-0.5">{optionLine}</p>}
          <p className="text-xs text-gray-400 mt-0.5">Qty: {notification.qty}</p>
        </div>
      )}
    </div>
  )
}
