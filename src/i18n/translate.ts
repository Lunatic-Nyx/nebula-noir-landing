import { messages, type Locale } from '@/i18n/messages'

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
  vars?: Record<string, string | number>
): string {
  let value = lookup(messages[locale] as unknown as Dict, path)
  if (vars) {
    for (const [key, item] of Object.entries(vars)) {
      value = value.replaceAll(`{${key}}`, String(item))
    }
  }
  return value
}
