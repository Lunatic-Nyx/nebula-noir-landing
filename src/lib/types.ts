export type JewelryCategory = string

export interface Category {
  id?: string
  slug: string
  label: string
  labelEn?: string
  sortOrder?: number
}

export interface Product {
  id: string
  name: string
  description: string
  /** Optional per-product notice (materials, care, made-to-order, ...). */
  notice?: string
  category: JewelryCategory
  image: string
  madeToOrder: boolean
  estimatedDays?: number
}

export interface GalleryItem {
  id: string
  name: string
  description: string
  /** Optional per-product notice editable in Admin → Galerie. */
  notice?: string
  category: JewelryCategory
  image: string
  alt?: string
}

export interface EventItem {
  id: string
  title: string
  venue: string
  city: string
  startsAt: string
  endsAt?: string | null
  description: string
  url?: string | null
}

export interface InstagramPost {
  id: string
  caption: string
  mediaType: string
  mediaUrl: string
  permalink: string
  thumbnailUrl?: string | null
  timestamp?: string | null
}

export interface BrandInfo {
  key: string
  title: string
  body: string
}
