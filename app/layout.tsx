import type { Metadata } from 'next'
import { CursorGlow } from '@/components/CursorGlow'
import { SmoothScroll } from '@/components/SmoothScroll'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'
import { LocaleProvider } from '@/i18n/context'
import { getServerLocale } from '@/i18n/server'
import { getTranslationOverrides } from '@/i18n/overrides'
import { translate } from '@/i18n/translate'
import { getFooterConfig, getPublicSiteConfig } from '@/lib/site-config'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import '@/styles/fonts.css'
import '@/main.css'
import '@/styles/theme.css'
import '@/index.css'
import '@/themes/nebula-noir-theme/styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const [locale, overrides] = await Promise.all([getServerLocale(), getTranslationOverrides()])
  return {
    title: translate(locale, 'meta.title', undefined, overrides),
    description: translate(locale, 'meta.description', undefined, overrides),
    icons: {
      icon: '/favicon.svg',
      apple: '/favicon.svg',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, overrides, siteConfig, footerConfig] = await Promise.all([
    getServerLocale(),
    getTranslationOverrides(),
    getPublicSiteConfig(),
    getFooterConfig(),
  ])

  return (
    <html lang={locale} style={{ scrollPaddingTop: SCROLL_OFFSET_VAR }}>
      <head>
        {/* Self-hosted brand fonts: preload so the first paint never falls back. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/poiret-one-latin-400.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/montserrat-latin.woff2"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LocaleProvider initialLocale={locale} overrides={overrides}>
          <SiteConfigProvider site={siteConfig} footer={footerConfig}>
            <SmoothScroll />
            <CursorGlow />
            {children}
          </SiteConfigProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
