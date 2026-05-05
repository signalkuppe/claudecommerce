import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSetting, setSetting } from '@/lib/settings'

export async function GET(request: Request) {
  const session = await auth()
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  const value = await getSetting(key)
  return NextResponse.json({ key, value })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { key, value } = await request.json()
  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await setSetting(key, value)
  return NextResponse.json({ ok: true })
}
