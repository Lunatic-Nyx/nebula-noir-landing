'use server'

import { revalidatePath } from 'next/cache'
import { isR2Configured } from '@/lib/env'
import { requireAdmin } from '@/lib/admin-gate'
import { createServerSupabase } from '@/lib/supabase/server'
import { deleteFromR2, publicObjectUrl } from '@/lib/r2'
import { clampNotice } from '@/lib/notice'
import { syncInstagramPosts } from '@/lib/instagram'

export async function saveBrandInfo(key: string, title: string, body: string) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase.from('brand_info').upsert({ key, title, body, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  return { ok: true as const }
}

export async function deleteBrandInfo(key: string) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase.from('brand_info').delete().eq('key', key)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  return { ok: true as const }
}

export async function saveEvent(input: {
  id?: string
  title: string
  venue: string
  city: string
  startsAt: string
  endsAt?: string
  description: string
  url?: string
  published: boolean
}) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const toIso = (value: string) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }
  const payload = {
    title: input.title,
    venue: input.venue,
    city: input.city,
    starts_at: toIso(input.startsAt) || input.startsAt,
    ends_at: toIso(input.endsAt || ''),
    description: input.description,
    url: input.url || null,
    published: input.published,
  }
  const query = input.id
    ? supabase.from('events').update(payload).eq('id', input.id)
    : supabase.from('events').insert(payload)
  const { error } = await query
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/events')
  return { ok: true as const }
}

export async function deleteEvent(id: string) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  return { ok: true as const }
}

export async function markInquiryRead(id: string, read: boolean) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase.from('contact_inquiries').update({ read }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/inquiries')
  return { ok: true as const }
}

export async function deleteInquiry(id: string) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase.from('contact_inquiries').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/admin/inquiries')
  return { ok: true as const }
}

export async function deleteGalleryImage(id: string) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { data } = await supabase.from('gallery_images').select('r2_key').eq('id', id).maybeSingle()
  if (data?.r2_key && isR2Configured()) {
    try {
      await deleteFromR2(data.r2_key as string)
    } catch {
      // continue deleting row
    }
  }
  const { error } = await supabase.from('gallery_images').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { ok: true as const }
}

export async function updateGalleryMeta(id: string, input: {
  title: string
  description: string
  notice?: string
  published: boolean
  sortOrder: number
  category?: string
}) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }

  const payload: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    notice: clampNotice(input.notice),
    published: input.published,
    sort_order: input.sortOrder,
  }
  if (input.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', input.category)
      .maybeSingle()
    if (!category) return { ok: false as const, error: 'Kategorie unbekannt' }
    payload.category_id = category.id
  }

  const { error } = await supabase
    .from('gallery_images')
    .update(payload)
    .eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/gallery')
  return { ok: true as const }
}

export async function confirmHeroVideo(input: { key: string; publicUrl: string }) {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  // Only accept keys issued by the server presign route; never trust a client URL.
  if (!input.key.startsWith('hero/')) {
    return { ok: false as const, error: gate.t('admin.uploadFailed') }
  }
  const publicUrl = isR2Configured() ? publicObjectUrl(input.key) : input.publicUrl
  const { data: existing } = await supabase.from('brand_info').select('title').eq('key', 'hero_video').maybeSingle()
  const previousKey = existing?.title as string | undefined
  const { error } = await supabase.from('brand_info').upsert(
    {
      key: 'hero_video',
      title: input.key,
      body: publicUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )
  if (error) return { ok: false as const, error: error.message }
  // Only remove the previous object once the new reference is persisted.
  if (previousKey && previousKey !== input.key && isR2Configured()) {
    try {
      await deleteFromR2(previousKey)
    } catch {
      // keep going
    }
  }
  revalidatePath('/')
  revalidatePath('/admin/hero')
  return { ok: true as const }
}

export async function clearHeroVideo() {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: gate.t('admin.supabaseMissing') }
  const { data: existing } = await supabase.from('brand_info').select('title').eq('key', 'hero_video').maybeSingle()
  const previousKey = existing?.title as string | undefined
  const { error } = await supabase.from('brand_info').delete().eq('key', 'hero_video')
  if (error) return { ok: false as const, error: error.message }
  // Only remove the object once the reference is gone from the database.
  if (previousKey && isR2Configured()) {
    try {
      await deleteFromR2(previousKey)
    } catch {
      // keep going
    }
  }
  revalidatePath('/')
  revalidatePath('/admin/hero')
  return { ok: true as const }
}

export async function triggerInstagramSync() {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false as const, error: gate.error }
  if (gate.demo) return { ok: false as const, error: gate.t('admin.demoSyncDisabled') }
  const result = await syncInstagramPosts()
  if (!result.ok) return { ok: false as const, error: result.error || gate.t('admin.syncFailed') }
  revalidatePath('/')
  return { ok: true as const, count: result.count }
}
