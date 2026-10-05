import { cache } from 'react'
import { parseTranslationOverrides, type TranslationOverrides } from '@/i18n/paths'
import { readConfigValue } from '@/lib/site-config'

// Server-only. Overrides are loaded once per request (React cache) and shared
// by the root layout, generateMetadata and getServerT.
export const getTranslationOverrides = cache(async (): Promise<TranslationOverrides> => {
  return parseTranslationOverrides(await readConfigValue('translations'))
})
