// Isomorphic types for the public site config (safe for client imports).
export interface PublicSiteConfig {
  etsyUrl: string
  instagramUrl: string
  contactEmail: string
}

export interface LocalizedText {
  de: string
  en: string
}

export interface FooterLinkConfig {
  label: LocalizedText
  href: string
  external?: boolean
}

export interface FooterColumnConfig {
  title: LocalizedText
  links: FooterLinkConfig[]
}

export interface FooterConfig {
  blurb: LocalizedText
  columns: FooterColumnConfig[]
  copyright: LocalizedText
  madeIn: LocalizedText
}
