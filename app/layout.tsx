import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { CursorGlow } from '@/components/CursorGlow'
import { SmoothScroll } from '@/components/SmoothScroll'
import { LocaleProvider } from '@/i18n/context'
import type { Locale } from '@/i18n/messages'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import '@/main.css'
import '@/styles/theme.css'
import '@/index.css'
import '@/themes/nebula-noir-theme/styles.css'

export const metadata: Metadata = {
  title: 'NEBULA NOIR | Cybergoth Industrial',
  description:
    'Statement jewelry for the black scene. Faux leather, PVC, chains, rivets, neon. Made in Germany.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookie = (await cookies()).get('nn-locale')?.value
  const locale: Locale = cookie === 'en' ? 'en' : 'de'

  return (
    <html lang={locale} style={{ scrollPaddingTop: SCROLL_OFFSET_VAR }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Cinzel:wght@400;600;700;900&family=Montserrat:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LocaleProvider initialLocale={locale}>
          <SmoothScroll />
          <CursorGlow />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
