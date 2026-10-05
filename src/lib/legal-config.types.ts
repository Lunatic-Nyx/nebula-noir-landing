import type { LegalSection } from '@/lib/legal-content'

export type LocaleCode = 'de' | 'en'
export type LocalizedText = Partial<Record<LocaleCode, string>>

export interface LegalSectionConfig {
  title: LocalizedText
  content: LocalizedText
}

export type LegalConfig = Record<LegalSection, LegalSectionConfig>
