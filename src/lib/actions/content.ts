'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-gate'
import { createServerSupabase } from '@/lib/supabase/server'
import { parseTranslationOverrides } from '@/i18n/paths'
import { parseLegalConfig, parsePublicSiteConfig } from '@/lib/site-config'
import { parseFooterConfig } from '@/lib/footer-config'

type ContentSaveResult = { ok: true } | { ok: false; error: string }

async function upsertConfig(key: string, value: unknown): Promise<ContentSaveResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: gate.t('admin.supabaseMissing') }
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/', 'layout')
  revalidatePath('/admin/content')
  return { ok: true }
}

export async function saveSiteConfig(input: unknown): Promise<ContentSaveResult> {
  return upsertConfig('site', parsePublicSiteConfig(input))
}

export async function saveTranslations(input: unknown): Promise<ContentSaveResult> {
  return upsertConfig('translations', parseTranslationOverrides(input))
}

export async function saveLegalConfig(input: unknown): Promise<ContentSaveResult> {
  return upsertConfig('legal', parseLegalConfig(input))
}

export async function saveFooterConfig(input: unknown): Promise<ContentSaveResult> {
  return upsertConfig('footer', parseFooterConfig(input))
}
