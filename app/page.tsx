import { HomePage } from '@/components/HomePage'
import { brandMap, galleryAsProducts, getBrandInfo, getCategories, getEvents, getGallery, getHeroVideoUrl, getInstagramPosts } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [gallery, brandInfo, events, instagram, heroVideoUrl, categories] = await Promise.all([
    getGallery(),
    getBrandInfo(),
    getEvents({ upcomingOnly: true }),
    getInstagramPosts(),
    getHeroVideoUrl(),
    getCategories(),
  ])

  return (
    <HomePage
      products={galleryAsProducts(gallery)}
      brandInfo={brandMap(brandInfo)}
      events={events}
      instagram={instagram}
      heroVideoUrl={heroVideoUrl}
      categories={categories}
    />
  )
}
