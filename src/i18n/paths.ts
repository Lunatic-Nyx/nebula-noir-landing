import { messages, type Locale } from '@/i18n/messages'

type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`
}[keyof T & string]

/** Every overridable translation path (leaf) derived from the default German tree. */
export type MessagePath = Leaves<typeof messages.de>

export type TranslationOverrides = Partial<Record<Locale, Partial<Record<MessagePath, string>>>>

function collectPaths(tree: unknown, prefix: string, out: Set<string>) {
  if (!tree || typeof tree !== 'object') return
  for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out.add(path)
    else collectPaths(value, path, out)
  }
}

export const MESSAGE_PATHS: ReadonlySet<string> = (() => {
  const set = new Set<string>()
  collectPaths(messages.de, '', set)
  return set
})()

const MAX_VALUE_LENGTH = 5000

/**
 * Defensive parser for the `translations` site_config value. Unknown locales,
 * unknown paths, non-strings, empty strings and oversized values are dropped.
 */
export function parseTranslationOverrides(raw: unknown): TranslationOverrides {
  const result: TranslationOverrides = {}
  if (!raw || typeof raw !== 'object') return result
  for (const locale of ['de', 'en'] as const) {
    const entries = (raw as Record<string, unknown>)[locale]
    if (!entries || typeof entries !== 'object') continue
    const localeResult: Partial<Record<MessagePath, string>> = {}
    for (const [path, value] of Object.entries(entries as Record<string, unknown>)) {
      if (typeof value !== 'string') continue
      if (value.length === 0 || value.length > MAX_VALUE_LENGTH) continue
      if (!MESSAGE_PATHS.has(path)) continue
      localeResult[path as MessagePath] = value
    }
    if (Object.keys(localeResult).length > 0) result[locale] = localeResult
  }
  return result
}

export function isTranslationPath(path: string): path is MessagePath {
  return MESSAGE_PATHS.has(path)
}
