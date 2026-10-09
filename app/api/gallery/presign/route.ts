import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'
import { isDemoMode, isR2Configured } from '@/lib/env'
import { extensionForMime, isAllowedImageType, presignPut, R2_MAX_BYTES } from '@/lib/r2'

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: 'Demo Mode: Upload deaktiviert' }, { status: 400 })
  }
  const session = await getAdminUser()
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }
  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 ist nicht konfiguriert' }, { status: 400 })
  }

  const body = (await request.json()) as { contentType?: string; size?: number }
  const contentType = String(body.contentType || '')
  const size = Number(body.size || 0)
  if (!isAllowedImageType(contentType)) {
    return NextResponse.json({ error: 'Dateityp nicht erlaubt' }, { status: 400 })
  }
  if (!size || size > R2_MAX_BYTES) {
    return NextResponse.json({ error: 'Datei größer als 10MB' }, { status: 400 })
  }

  const key = `gallery/${crypto.randomUUID()}.${extensionForMime(contentType)}`
  const uploadUrl = await presignPut(key, contentType, size)
  return NextResponse.json({ uploadUrl, key })
}
