// Single source of truth for repeated visual values.
// Refactors here must keep the rendered output byte-for-byte identical.

/** Toning applied to gallery/instagram imagery on the card and detail views. */
export const IMAGE_FILTER = 'contrast(1.1) brightness(0.95)'

/** Shared sonner toast chrome (HomePage, SiteChrome, AdminShell). */
export const TOAST_STYLE = {
  background: 'oklch(0.08 0 0)',
  color: 'oklch(0.99 0 0)',
  border: '1px solid oklch(0.45 0.15 300)',
} as const

/** CSS custom property that holds the fixed-header anchor offset (see src/main.css). */
export const SCROLL_OFFSET_VAR = 'var(--nn-scroll-offset)'
