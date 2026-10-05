'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/messages'
import type { TranslationOverrides } from '@/i18n/paths'
import { translate } from '@/i18n/translate'

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function LocaleProvider({
  children,
  initialLocale,
  overrides,
}: {
  children: React.ReactNode
  initialLocale: Locale
  overrides?: TranslationOverrides
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.documentElement.lang = next
    document.cookie = `nn-locale=${next};path=/;max-age=31536000;samesite=lax`
  }, [])

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => translate(locale, path, vars, overrides),
    [locale, overrides]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside LocaleProvider')
  return ctx
}

export function useT() {
  return useI18n().t
}
