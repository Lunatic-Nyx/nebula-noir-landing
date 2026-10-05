'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/i18n/context'
import {
  CONSENT_COOKIE,
  consentCookieAttributes,
  parseConsent,
  serializeConsent,
} from '@/lib/consent'

function readConsentCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
  return match ? match.slice(CONSENT_COOKIE.length + 1) : null
}

export function CookieConsent() {
  const t = useT()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(parseConsent(readConsentCookie()) === null)
  }, [])

  if (!visible) return null

  const choose = (external: boolean) => {
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    document.cookie = `${CONSENT_COOKIE}=${serializeConsent(external)};${consentCookieAttributes(31_536_000, secure)}`
    setVisible(false)
    router.refresh()
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('consent.title')}
      className="fixed bottom-4 left-4 right-4 z-[10050] border-2 border-foreground/40 bg-background/98 p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md md:left-auto md:right-6 md:max-w-md"
    >
      <p className="text-sm uppercase tracking-[0.2em] bioshock-glow-animated">
        {t('consent.title')}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/70">{t('consent.text')}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose(true)}
          className="min-h-[44px] border-2 border-foreground bg-foreground px-4 text-xs uppercase tracking-[0.15em] text-background transition-all duration-300 hover:bg-transparent hover:text-foreground"
        >
          {t('consent.accept')}
        </button>
        <button
          type="button"
          onClick={() => choose(false)}
          className="min-h-[44px] border-2 border-foreground/40 px-4 text-xs uppercase tracking-[0.15em] text-foreground/80 transition-all duration-300 hover:border-foreground hover:text-foreground"
        >
          {t('consent.necessary')}
        </button>
        <a
          href="/datenschutz"
          className="flex min-h-[44px] items-center px-2 text-xs uppercase tracking-[0.15em] text-foreground/60 underline transition-colors hover:text-foreground"
        >
          {t('consent.more')}
        </a>
      </div>
    </div>
  )
}
