import { messages, type Locale } from '@/i18n/messages'
import type { MessagePath, TranslationOverrides } from '@/i18n/paths'

type Dict = Record<string, unknown>

function lookup(tree: Dict, path: string): string {
  const parts = path.split('.')
  let node: unknown = tree
  for (const part of parts) {
    if (!node || typeof node !== 'object') return path
    node = (node as Dict)[part]
  }
  return typeof node === 'string' ? node : path
}

export function translate(
  locale: Locale,
  path: string,
  vars?: Record<string, string | number>,
  overrides?: TranslationOverrides | null
): string {
  const override = overrides?.[locale]?.[path as MessagePath]
  let value =
    typeof override === 'string' && override.length > 0
      ? override
      : lookup(messages[locale] as unknown as Dict, path)
  if (vars) {
    for (const [key, item] of Object.entries(vars)) {
      value = value.replaceAll(`{${key}}`, String(item))
    }
  }
  return value
}

/** Default (code) message for editor placeholders. */
export function defaultMessage(locale: Locale, path: string): string {
  return lookup(messages[locale] as unknown as Dict, path)
}
