'use client'
import dynamic from 'next/dynamic'

const CartContents = dynamic(() => import('./CartContents'), { ssr: false })

export default function CartContentsWrapper() {
  return <CartContents />
}
