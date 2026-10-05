import { ContentManager } from '@/components/admin/ContentManager'
import { getFooterConfig, getLegalConfig, getPublicSiteConfig } from '@/lib/site-config'
import { getTranslationOverrides } from '@/i18n/overrides'

export default async function AdminContentPage() {
  const [siteConfig, overrides, legalConfig, footerConfig] = await Promise.all([
    getPublicSiteConfig(),
    getTranslationOverrides(),
    getLegalConfig(),
    getFooterConfig(),
  ])
  return (
    <ContentManager
      siteConfig={siteConfig}
      overrides={overrides}
      legalConfig={legalConfig}
      footerConfig={footerConfig}
    />
  )
}
