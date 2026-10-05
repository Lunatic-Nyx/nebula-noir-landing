import { GalleryManager } from '@/components/admin/GalleryManager'
import { getCategories, getGallery } from '@/lib/data'
import { isDemoMode } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import type { GalleryItem } from '@/lib/types'
import { getServerT } from '@/i18n/server'

type AdminGalleryItem = GalleryItem & { published?: boolean; sortOrder?: number }

export default async function AdminGalleryPage() {
  const t = await getServerT()
  const demo = isDemoMode()
  const categories = await getCategories()
  let items: AdminGalleryItem[] = await getGallery()
  if (!demo) {
    const supabase = await createServerSupabase()
    if (supabase) {
      const { data } = await supabase
        .from('gallery_images')
        .select('id, title, description, alt, public_url, sort_order, published, categories(slug)')
        .order('sort_order', { ascending: true })
      if (data) {
        const next: AdminGalleryItem[] = []
        for (const row of data) {
          const related = row.categories as { slug: string } | { slug: string }[] | null
          const slug = Array.isArray(related) ? related[0]?.slug : related?.slug
          if (!slug) continue
          next.push({
            id: row.id as string,
            name: row.title as string,
            description: (row.description as string) || '',
            category: slug,
            image: row.public_url as string,
            alt: (row.alt as string) || (row.title as string),
            published: row.published as boolean,
            sortOrder: (row.sort_order as number) ?? 0,
          })
        }
        items = next
      }
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.gallery')}</h2>
      <GalleryManager items={items} categories={categories} demo={demo} />
    </div>
  )
}
