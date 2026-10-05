import { ContentManager } from '@/components/admin/ContentManager'
import { getLegalConfig, getPublicSiteConfig } from '@/lib/site-config'
import { getTranslationOverrides } from '@/i18n/overrides'

export default async function AdminContentPage() {
  const [siteConfig, overrides, legalConfig] = await Promise.all([
    getPublicSiteConfig(),
    getTranslationOverrides(),
    getLegalConfig(),
  ])
  return <ContentManager siteConfig={siteConfig} overrides={overrides} legalConfig={legalConfig} />
}
