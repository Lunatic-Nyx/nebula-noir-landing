// Conservative defense-in-depth sanitizer for admin-authored legal HTML.
// Not a full HTML sanitizer: it strips active content (scripts, iframes,
// event handlers, javascript: URLs). Legal content is admin-only writable and
// RLS-gated, so this is a second layer, not the primary trust boundary.
const ACTIVE_BLOCKS = /<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1>/gi
const ACTIVE_SINGLE = /<\/?(script|style|iframe|object|embed)\b[^>]*>/gi
const EVENT_ATTRS = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URLS = /\b(href|src)\s*=\s*("[^"]*javascript:[^"]*"|'[^']*javascript:[^']*'|javascript:[^\s>]+)/gi

export function sanitizeHtml(input: string): string {
  return input
    .replace(ACTIVE_BLOCKS, '')
    .replace(ACTIVE_SINGLE, '')
    .replace(EVENT_ATTRS, '')
    .replace(JS_URLS, '$1="#"')
}
