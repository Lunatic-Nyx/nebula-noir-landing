'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-gate'
import { createServerSupabase } from '@/lib/supabase/server'

export type CategoryResult = { ok: true } | { ok: false; error: string; count?: number }

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function revalidateCategories() {
  revalidatePath('/')
  revalidatePath('/admin/gallery')
  revalidatePath('/admin/categories')
}

export async function saveCategory(input: {
  id?: string
  slug: string
  label: string
  labelEn: string
  sortOrder: number
}): Promise<CategoryResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: gate.t('admin.supabaseMissing') }

  const slug = input.slug.trim().toLowerCase()
  const label = input.label.trim()
  if (!slug || !label) return { ok: false, error: 'Slug und Label sind Pflicht' }
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: 'Slug: nur a-z, 0-9 und Bindestriche' }

  const payload = {
    slug,
    label,
    label_en: input.labelEn.trim(),
    sort_order: Number(input.sortOrder) || 0,
  }
  const query = input.id
    ? supabase.from('categories').update(payload).eq('id', input.id)
    : supabase.from('categories').insert(payload)
  const { error } = await query
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Slug ist bereits vergeben' }
    return { ok: false, error: error.message }
  }
  revalidateCategories()
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<CategoryResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: gate.t('admin.supabaseMissing') }

  const { count, error: countError } = await supabase
    .from('gallery_images')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if (countError) return { ok: false, error: countError.message }
  if ((count ?? 0) > 0) {
    return { ok: false, error: `Kategorie wird von ${count} Bild(ern) verwendet`, count: count ?? 0 }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') return { ok: false, error: 'Kategorie wird noch verwendet' }
    return { ok: false, error: error.message }
  }
  revalidateCategories()
  return { ok: true }
}

export async function reassignCategory(fromId: string, toId: string): Promise<CategoryResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: gate.t('admin.supabaseMissing') }
  if (!fromId || !toId || fromId === toId) {
    return { ok: false, error: 'Quelle und Ziel müssen verschieden sein' }
  }

  const { error } = await supabase
    .from('gallery_images')
    .update({ category_id: toId })
    .eq('category_id', fromId)
  if (error) return { ok: false, error: error.message }
  revalidateCategories()
  return { ok: true }
}
