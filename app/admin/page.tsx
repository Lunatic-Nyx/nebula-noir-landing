import { isDemoMode, isInstagramConfigured, isR2Configured } from '@/lib/env'
import { getServerT } from '@/i18n/server'

export default async function AdminHome() {
  const t = await getServerT()
  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.overview')}</h2>
      <ul className="space-y-4 text-sm uppercase tracking-wider text-foreground/80">
        <li>Demo Mode: {isDemoMode() ? t('admin.statusOn') : t('admin.statusOff')}</li>
        <li>R2: {isR2Configured() ? t('admin.statusConfigured') : t('admin.statusMissing')}</li>
        <li>Instagram: {isInstagramConfigured() ? t('admin.statusConfigured') : t('admin.statusMissing')}</li>
      </ul>
      <p className="text-foreground/70 font-light">{t('admin.homeIntro')}</p>
    </div>
  )
}
