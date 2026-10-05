import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'
import { isDemoMode, isR2Configured } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { extensionForMime, isAllowedImageType, R2_MAX_BYTES, deleteFromR2, uploadToR2 } from '@/lib/r2'

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

  const form = await request.formData()
  const file = form.get('file')
  const title = String(form.get('title') || '').trim()
  const description = String(form.get('description') || '').trim()
  const categorySlug = String(form.get('category') || '').trim()
  const alt = String(form.get('alt') || title).trim()

  if (!(file instanceof File) || !title || !categorySlug) {
    return NextResponse.json({ error: 'Datei, Titel und Kategorie sind Pflicht' }, { status: 400 })
  }
  if (!isAllowedImageType(file.type)) {
    return NextResponse.json({ error: 'Dateityp nicht erlaubt' }, { status: 400 })
  }
  if (file.size > R2_MAX_BYTES) {
    return NextResponse.json({ error: 'Datei größer als 10MB' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase fehlt' }, { status: 500 })
  }

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()
  if (catError || !category) {
    return NextResponse.json({ error: 'Kategorie unbekannt' }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const ext = extensionForMime(file.type)
  const key = `gallery/${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const publicUrl = await uploadToR2(key, buffer, file.type)

  const { error } = await supabase.from('gallery_images').insert({
    id,
    category_id: category.id,
    title,
    description,
    alt,
    r2_key: key,
    public_url: publicUrl,
    published: true,
  })
  if (error) {
    // Roll back the uploaded object so a failed insert does not orphan it in R2.
    await deleteFromR2(key).catch(() => {})
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return NextResponse.json({ ok: true, id, url: publicUrl })
}
