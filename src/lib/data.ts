import { isDemoMode } from '@/lib/env'
import {
  fixtureBrandInfo,
  fixtureEvents,
  fixtureGallery,
  fixtureInstagram,
  isJewelryCategory,
} from '@/lib/fixtures'
import { createServerSupabase } from '@/lib/supabase/server'
import type { BrandInfo, EventItem, GalleryItem, InstagramPost, JewelryCategory } from '@/lib/types'

export async function getGallery(): Promise<GalleryItem[]> {
  if (isDemoMode()) return fixtureGallery
  const supabase = await createServerSupabase()
  if (!supabase) return fixtureGallery
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, title, description, alt, public_url, categories(slug)')
    .eq('published', true)
    .order('sort_order', { ascending: true })
  if (error || !data) return []
  const items: GalleryItem[] = []
  for (const row of data) {
    const related = row.categories as { slug: string } | { slug: string }[] | null
    const slug = Array.isArray(related) ? related[0]?.slug : related?.slug
    if (!slug || !isJewelryCategory(slug)) continue
    items.push({
      id: row.id as string,
      name: row.title as string,
      description: (row.description as string) || '',
      category: slug,
      image: row.public_url as string,
      alt: (row.alt as string) || (row.title as string),
    })
  }
  return items
}

export async function getBrandInfo(): Promise<BrandInfo[]> {
  if (isDemoMode()) return fixtureBrandInfo
  const supabase = await createServerSupabase()
  if (!supabase) return fixtureBrandInfo
  const { data, error } = await supabase.from('brand_info').select('key, title, body')
  if (error || !data) return []
  return data as BrandInfo[]
}

function isUpcomingEvent(event: Pick<EventItem, 'startsAt' | 'endsAt'>, now = Date.now()) {
  const end = Date.parse(event.endsAt || event.startsAt)
  return Number.isNaN(end) || end >= now
}

export async function getEvents(opts?: { upcomingOnly?: boolean }): Promise<EventItem[]> {
  const upcomingOnly = opts?.upcomingOnly === true
  const filterUpcoming = (events: EventItem[]) =>
    upcomingOnly ? events.filter((event) => isUpcomingEvent(event)) : events

  if (isDemoMode()) return filterUpcoming(fixtureEvents)
  const supabase = await createServerSupabase()
  if (!supabase) return filterUpcoming(fixtureEvents)
  const { data, error } = await supabase
    .from('events')
    .select('id, title, venue, city, starts_at, ends_at, description, url')
    .eq('published', true)
    .order('starts_at', { ascending: true })
  if (error || !data) return []
  const events: EventItem[] = data.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    venue: (row.venue as string) || '',
    city: (row.city as string) || '',
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string) || null,
    description: (row.description as string) || '',
    url: (row.url as string) || null,
  }))
  return filterUpcoming(events)
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  if (isDemoMode()) return fixtureInstagram
  const supabase = await createServerSupabase()
  if (!supabase) return fixtureInstagram
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('id, caption, media_type, media_url, permalink, thumbnail_url, timestamp')
    .order('timestamp', { ascending: false })
    .limit(12)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id as string,
    caption: (row.caption as string) || '',
    mediaType: (row.media_type as string) || 'IMAGE',
    mediaUrl: row.media_url as string,
    permalink: row.permalink as string,
    thumbnailUrl: (row.thumbnail_url as string) || null,
    timestamp: (row.timestamp as string) || null,
  }))
}

export function galleryAsProducts(items: GalleryItem[]): import('@/lib/types').Product[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: 0,
    category: item.category as JewelryCategory,
    image: item.image,
    madeToOrder: false,
  }))
}

export function brandMap(items: BrandInfo[]): Record<string, BrandInfo> {
  return Object.fromEntries(items.filter((item) => item.key !== 'hero_video').map((item) => [item.key, item]))
}

export async function getHeroVideoUrl(): Promise<string | undefined> {
  const envUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL
  if (envUrl) return envUrl
  if (isDemoMode()) return undefined
  const supabase = await createServerSupabase()
  if (!supabase) return undefined
  const { data } = await supabase.from('brand_info').select('body').eq('key', 'hero_video').maybeSingle()
  const url = data?.body as string | undefined
  return url && url.length > 0 ? url : undefined
}
