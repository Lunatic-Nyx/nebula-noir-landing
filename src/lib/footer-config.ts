import type { FooterColumnConfig, FooterConfig, FooterLinkConfig, LocalizedText } from '@/lib/site-config.types'

// Isomorphic footer config: defaults, defensive parser and helpers used by the
// public footer and the admin editor.
const MAX_COLUMNS = 12
const MAX_LINKS = 24
const MAX_LABEL = 160
const MAX_HREF = 500

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  blurb: {
    de: 'Statementschmuck für die schwarze Szene. Cybergoth, Industrial, Cyberpunk. Made in Germany.',
    en: 'Statement jewelry for the black scene. Cybergoth, industrial, cyberpunk. Made in Germany.',
  },
  columns: [
    {
      title: { de: 'Shop', en: 'Shop' },
      links: [
        { label: { de: 'Kollektion', en: 'Collection' }, href: '/#catalog' },
        { label: { de: 'Philosophie', en: 'Philosophy' }, href: '/#about' },
        { label: { de: 'Maßanfertigungen', en: 'Custom work' }, href: '/#contact' },
        { label: { de: 'Custom Orders', en: 'Custom orders' }, href: '/custom-orders' },
      ],
    },
    {
      title: { de: 'Info', en: 'Info' },
      links: [
        { label: { de: 'Über Uns', en: 'About us' }, href: '/ueber-uns' },
        { label: { de: 'Versand', en: 'Shipping' }, href: '/versand' },
        {
          label: { de: 'Etsy Shop', en: 'Etsy shop' },
          href: 'https://www.etsy.com/shop/nebulanoirnn',
          external: true,
        },
      ],
    },
    {
      title: { de: 'Rechtliches', en: 'Legal' },
      links: [
        { label: { de: 'Impressum', en: 'Imprint' }, href: '/impressum' },
        { label: { de: 'Datenschutz', en: 'Privacy' }, href: '/datenschutz' },
        { label: { de: 'AGB', en: 'Terms' }, href: '/agb' },
        { label: { de: 'Widerruf', en: 'Withdrawal' }, href: '/widerruf' },
        { label: { de: 'Produkthinweise', en: 'Product notes' }, href: '/produkthinweise' },
      ],
    },
  ],
  copyright: {
    de: '© {year} Nebula Noir. Handgemacht in Deutschland.',
    en: '© {year} Nebula Noir. Handmade in Germany.',
  },
  madeIn: { de: 'Made in Germany', en: 'Made in Germany' },
}

export function isSafeHref(href: string): boolean {
  const value = href.trim()
  if (!value) return false
  if (value.startsWith('//')) return false
  if (value.startsWith('/') || value.startsWith('#')) return true
  return /^(https?:|mailto:|tel:)/i.test(value)
}

/** Non-empty and not a safe link. Empty is allowed (means “no link”). */
export function unsafePublicUrl(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0 && !isSafeHref(value)
}

function localized(value: unknown, fallback: LocalizedText): LocalizedText {
  if (!value || typeof value !== 'object') return { ...fallback }
  const record = value as Record<string, unknown>
  const de =
    typeof record.de === 'string' && record.de.trim().length > 0
      ? record.de.trim().slice(0, MAX_LABEL)
      : fallback.de
  const en =
    typeof record.en === 'string' && record.en.trim().length > 0
      ? record.en.trim().slice(0, MAX_LABEL)
      : de
  return { de, en }
}

function parseLink(value: unknown): FooterLinkConfig | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const href = typeof record.href === 'string' ? record.href.trim().slice(0, MAX_HREF) : ''
  if (!isSafeHref(href)) return null
  return {
    label: localized(record.label, { de: href, en: href }),
    href,
    external: record.external === true || /^https?:/i.test(href),
  }
}

export function parseFooterConfig(raw: unknown): FooterConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_FOOTER_CONFIG
  const record = raw as Record<string, unknown>

  let columns: FooterColumnConfig[]
  if (Array.isArray(record.columns)) {
    columns = record.columns.slice(0, MAX_COLUMNS).flatMap((columnRaw) => {
      if (!columnRaw || typeof columnRaw !== 'object') return []
      const column = columnRaw as Record<string, unknown>
      const links = (Array.isArray(column.links) ? column.links.slice(0, MAX_LINKS) : [])
        .map(parseLink)
        .filter((link): link is FooterLinkConfig => link !== null)
      return [{ title: localized(column.title, { de: '', en: '' }), links }]
    })
  } else {
    columns = DEFAULT_FOOTER_CONFIG.columns.map((column) => ({
      title: { ...column.title },
      links: column.links.map((link) => ({ ...link, label: { ...link.label } })),
    }))
  }

  return {
    blurb: localized(record.blurb, DEFAULT_FOOTER_CONFIG.blurb),
    columns,
    copyright: localized(record.copyright, DEFAULT_FOOTER_CONFIG.copyright),
    madeIn: localized(record.madeIn, DEFAULT_FOOTER_CONFIG.madeIn),
  }
}

export function footerText(value: LocalizedText, locale: 'de' | 'en'): string {
  return locale === 'en' ? value.en || value.de : value.de || value.en
}
