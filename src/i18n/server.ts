import { cookies } from 'next/headers'
import { translate } from '@/i18n/translate'
import type { Locale } from '@/i18n/messages'

export async function getServerLocale(): Promise<Locale> {
  const cookie = (await cookies()).get('nn-locale')?.value
  return cookie === 'en' ? 'en' : 'de'
}

export async function getServerT() {
  const locale = await getServerLocale()
  return (path: string, vars?: Record<string, string | number>) => translate(locale, path, vars)
}
