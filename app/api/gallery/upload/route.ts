import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'
import { isDemoMode, isR2Configured } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { deleteFromR2, publicObjectUrl } from '@/lib/r2'
import { clampNotice } from '@/lib/notice'

const GALLERY_KEY = /^gallery\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/

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

  const body = (await request.json()) as {
    key?: string
    title?: string
    description?: string
    notice?: unknown
    category?: string
    alt?: string
  }
  const key = String(body.key || '')
  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  const notice = clampNotice(body.notice)
  const categorySlug = String(body.category || '').trim()
  const alt = String(body.alt || title).trim()

  if (!GALLERY_KEY.test(key) || !title || !categorySlug) {
    return NextResponse.json({ error: 'Datei, Titel und Kategorie sind Pflicht' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  if (!supabase) {
    await deleteFromR2(key).catch(() => {})
    return NextResponse.json({ error: 'Supabase fehlt' }, { status: 500 })
  }

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()
  if (catError || !category) {
    await deleteFromR2(key).catch(() => {})
    return NextResponse.json({ error: 'Kategorie unbekannt' }, { status: 400 })
  }

  const publicUrl = publicObjectUrl(key)
  const { error } = await supabase.from('gallery_images').insert({
    category_id: category.id,
    title,
    description,
    notice,
    alt,
    r2_key: key,
    public_url: publicUrl,
    published: true,
  })
  if (error) {
    await deleteFromR2(key).catch(() => {})
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return NextResponse.json({ ok: true, url: publicUrl })
}
