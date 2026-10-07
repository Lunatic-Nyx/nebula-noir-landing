/**
 * Shared helper for operator-authored product notices (plain text).
 * Used by the public gallery reader, the admin actions and the upload route so
 * the per-product notice is bounded the same way as the global site notice.
 */
const MAX_PRODUCT_NOTICE = 2000

export function clampNotice(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_PRODUCT_NOTICE) : ''
}
