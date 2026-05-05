import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2>404 — Page not found</h2>
      <Link href="/" style={{ marginTop: 16 }}>Go home</Link>
    </div>
  )
}
