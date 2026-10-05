import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { CookieConsent } from '@/components/CookieConsent'
import { CursorGlow } from '@/components/CursorGlow'
import { SmoothScroll } from '@/components/SmoothScroll'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'
import { LocaleProvider } from '@/i18n/context'
import { getServerLocale } from '@/i18n/server'
import { getTranslationOverrides } from '@/i18n/overrides'
import { translate } from '@/i18n/translate'
import { CONSENT_COOKIE, parseConsent } from '@/lib/consent'
import { getFooterConfig, getPublicSiteConfig } from '@/lib/site-config'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
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
  const [locale, overrides, siteConfig, footerConfig, cookieStore] = await Promise.all([
    getServerLocale(),
    getTranslationOverrides(),
    getPublicSiteConfig(),
    getFooterConfig(),
    cookies(),
  ])
  const consent = parseConsent(cookieStore.get(CONSENT_COOKIE)?.value)
  const externalAllowed = consent?.external === true

  return (
    <html lang={locale} style={{ scrollPaddingTop: SCROLL_OFFSET_VAR }}>
      <head>
        {externalAllowed ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
              href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Cinzel:wght@400;600;700;900&family=Montserrat:wght@300;400;500;600&display=swap"
              rel="stylesheet"
            />
          </>
        ) : null}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LocaleProvider initialLocale={locale} overrides={overrides}>
          <SiteConfigProvider site={siteConfig} footer={footerConfig}>
            <SmoothScroll />
            <CursorGlow />
            {children}
            <CookieConsent />
          </SiteConfigProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
