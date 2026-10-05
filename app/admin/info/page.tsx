import { InfoManager } from '@/components/admin/InfoManager'
import { getBrandInfo } from '@/lib/data'
import { isDemoMode } from '@/lib/env'
import { getAdminT } from '@/i18n/server'

export default async function AdminInfoPage() {
  const t = await getAdminT()
  const items = (await getBrandInfo()).filter((item) => item.key !== 'hero_video')
  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.info')}</h2>
      <InfoManager items={items} demo={isDemoMode()} />
    </div>
  )
}
