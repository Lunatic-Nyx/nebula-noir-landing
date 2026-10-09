import { isSafeHref } from '@/lib/footer-config'

// Allowlist for admin-authored legal HTML. Unknown tags are unwrapped (their
// text stays). Only tags we emit ourselves can appear in the result.
// h4 and code are in the list because the shipped legal pages use them.
const ALLOWED = new Set(['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'code'])
// No `i` flag: onePass emits lowercase only. Ignore-case would keep <ſtrong onclick>.
const ALLOWED_TAG = /<(?:\/?(?:p|br|strong|em|ul|ol|li|h[1-4]|a|code)\b[^>]*>)/g
const TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\/?>/g

function readAttr(attrs: string, name: string): string {
  const match = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, 'i'))
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function onePass(input: string): string {
  return input.replace(TAG, (match, rawName: string, attrs: string) => {
    const tag = rawName.toLowerCase()
    if (!ALLOWED.has(tag)) return ''
    if (match.startsWith('</')) return tag === 'br' ? '' : `</${tag}>`
    if (tag === 'br') return '<br>'
    if (tag !== 'a') return `<${tag}>`
    const href = readAttr(attrs, 'href')
    if (!href || !isSafeHref(href)) return '<a>'
    const external = /^https?:/i.test(href)
    const extra = external ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${escapeAttr(href)}"${extra}>`
  })
}

// A `<` we did not emit is text. Escaping it stops an unclosed `<img onerror`
// (no `>`) from becoming a tag at EOF, and keeps "a < b" on the page.
function escapeLooseAngles(value: string): string {
  const parts: string[] = []
  let last = 0
  ALLOWED_TAG.lastIndex = 0
  for (const match of value.matchAll(ALLOWED_TAG)) {
    const index = match.index ?? 0
    parts.push(value.slice(last, index).replace(/</g, '&lt;'))
    parts.push(match[0])
    last = index + match[0].length
  }
  parts.push(value.slice(last).replace(/</g, '&lt;'))
  return parts.join('')
}

export function sanitizeHtml(input: string): string {
  let current = input.replace(/<!--[\s\S]*?-->/g, '')
  for (let i = 0; i < 8; i++) {
    const next = onePass(current)
    if (next === current) return escapeLooseAngles(current)
    current = next
  }
  // Pass 8 can assemble <p onclick> or <a href="javascript:">. Do not keep those tags.
  return current.replace(/</g, '&lt;')
}
