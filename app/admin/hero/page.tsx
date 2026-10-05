import { HeroVideoManager } from '@/components/admin/HeroVideoManager'
import { getHeroVideoUrl } from '@/lib/data'
import { isDemoMode } from '@/lib/env'
import { getServerT } from '@/i18n/server'

export default async function AdminHeroPage() {
  const t = await getServerT()
  const url = await getHeroVideoUrl()
  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.hero')}</h2>
      <HeroVideoManager currentUrl={url} demo={isDemoMode()} />
    </div>
  )
}
