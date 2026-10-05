import { cache } from 'react'
import { isDemoMode } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { LEGAL_CONTENT, type LegalSection } from '@/lib/legal-content'
import { messages, type Locale } from '@/i18n/messages'
import { sanitizeHtml } from '@/lib/sanitize'
import type { PublicSiteConfig } from '@/lib/site-config.types'
import type { LegalConfig, LegalSectionConfig, LocalizedText } from '@/lib/legal-config.types'

export type { PublicSiteConfig } from '@/lib/site-config.types'
export type { LegalConfig, LegalSectionConfig, LocalizedText } from '@/lib/legal-config.types'

// Server-only config layer. Do NOT add a 'use server' directive.
// Any DB failure degrades to code defaults so public pages never break.

const CONFIG_TIMEOUT_MS = 1500

async function withTimeout<T>(promise: Promise<T>, fallback: T, ms = CONFIG_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms)
      }),
    ])
  } catch {
    return fallback
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Read one `site_config` row (public-read). Returns null in Demo Mode/on error. */
export async function readConfigValue(key: string): Promise<unknown> {
  if (isDemoMode()) return null
  return withTimeout(
    (async () => {
      try {
        const supabase = await createServerSupabase()
        if (!supabase) return null
        const { data, error } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', key)
          .maybeSingle()
        if (error || !data) return null
        return data.value as unknown
      } catch {
        return null
      }
    })(),
    null
  )
}

// --- public site config -------------------------------------------------------

export const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  etsyUrl: 'https://www.etsy.com/shop/nebulanoirnn',
  instagramUrl: 'https://www.instagram.com/nebula_noir.official',
  contactEmail: 'contact@nebula-noir.com',
}

function pickString(raw: Record<string, unknown>, key: string, fallback: string): string {
  const value = raw[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

export function parsePublicSiteConfig(raw: unknown): PublicSiteConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_PUBLIC_SITE_CONFIG
  const record = raw as Record<string, unknown>
  return {
    etsyUrl: pickString(record, 'etsyUrl', DEFAULT_PUBLIC_SITE_CONFIG.etsyUrl),
    instagramUrl: pickString(record, 'instagramUrl', DEFAULT_PUBLIC_SITE_CONFIG.instagramUrl),
    contactEmail: pickString(record, 'contactEmail', DEFAULT_PUBLIC_SITE_CONFIG.contactEmail),
  }
}

export const getPublicSiteConfig = cache(async (): Promise<PublicSiteConfig> => {
  return parsePublicSiteConfig(await readConfigValue('site'))
})

// --- legal content ------------------------------------------------------------

const DEFAULT_LEGAL_TITLE: Record<LegalSection, LocalizedText> = {
  impressum: { de: messages.de.footer.impressum, en: messages.en.footer.impressum },
  datenschutz: { de: messages.de.footer.privacy, en: messages.en.footer.privacy },
  agb: { de: messages.de.footer.terms, en: messages.en.footer.terms },
  widerruf: { de: messages.de.footer.withdrawal, en: messages.en.footer.withdrawal },
  versand: { de: messages.de.footer.shipping, en: messages.en.footer.shipping },
  customOrders: { de: messages.de.footer.customOrders, en: messages.en.footer.customOrders },
  about: { de: messages.de.footer.about, en: messages.en.footer.about },
}

function localized(value: unknown, fallback: LocalizedText, sanitize = false): LocalizedText {
  const result: LocalizedText = { ...fallback }
  if (!value || typeof value !== 'object') return result
  const record = value as Record<string, unknown>
  for (const locale of ['de', 'en'] as const) {
    const raw = record[locale]
    // Empty/whitespace means "use the default", never a blank page.
    if (typeof raw === 'string' && raw.trim().length > 0) {
      result[locale] = sanitize ? sanitizeHtml(raw) : raw
    }
  }
  return result
}

function defaultLegalConfig(): LegalConfig {
  const result = {} as LegalConfig
  for (const section of Object.keys(LEGAL_CONTENT) as LegalSection[]) {
    result[section] = {
      title: { ...DEFAULT_LEGAL_TITLE[section] },
      content: { de: LEGAL_CONTENT[section].content },
    }
  }
  return result
}

export function parseLegalConfig(raw: unknown): LegalConfig {
  const result = defaultLegalConfig()
  if (!raw || typeof raw !== 'object') return result
  for (const section of Object.keys(result) as LegalSection[]) {
    const entry = (raw as Record<string, unknown>)[section]
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    result[section] = {
      title: localized(record.title, result[section].title),
      content: localized(record.content, result[section].content, true),
    }
  }
  return result
}

export const getLegalConfig = cache(async (): Promise<LegalConfig> => {
  return parseLegalConfig(await readConfigValue('legal'))
})

export function resolveLegalSection(
  config: LegalConfig,
  section: LegalSection,
  locale: Locale
): { title: string; content: string } {
  const entry = config[section]
  return {
    title: entry.title[locale] || entry.title.de || DEFAULT_LEGAL_TITLE[section].de || section,
    content:
      entry.content[locale] ||
      entry.content.de ||
      LEGAL_CONTENT[section].content,
  }
}
