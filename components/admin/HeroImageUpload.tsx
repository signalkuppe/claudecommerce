'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function HeroImageUpload({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(currentUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setSaved(false)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) {
        setImageUrl(data.url)
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'hero_image_url', value: data.url }),
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">Hero image</p>

      <div className="relative w-full aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden mb-4">
        {imageUrl ? (
          <Image src={imageUrl} alt="Hero" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No image set
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Saved</span>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
