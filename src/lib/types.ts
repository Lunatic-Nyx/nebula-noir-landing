export type JewelryCategory = 'chokers' | 'bracelets' | 'rings' | 'earrings' | 'accessories'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: JewelryCategory
  image: string
  madeToOrder: boolean
  estimatedDays?: number
}

export interface GalleryItem {
  id: string
  name: string
  description: string
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
