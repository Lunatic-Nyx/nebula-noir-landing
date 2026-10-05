import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { syncInstagramPosts } from '@/lib/instagram'

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const provided = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await syncInstagramPosts()
  const status = result.ok ? 200 : 500
  return NextResponse.json(result, { status })
}
