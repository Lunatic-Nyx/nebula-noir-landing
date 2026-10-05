import type { Metadata } from 'next'
import { LegalDocument } from '@/components/LegalDocument'
import { getServerLocale } from '@/i18n/server'
import { getLegalConfig, resolveLegalSection } from '@/lib/site-config'
import type { LegalSection } from '@/lib/legal-content'

export async function legalPageMetadata(section: LegalSection): Promise<Metadata> {
  const [config, locale] = await Promise.all([getLegalConfig(), getServerLocale()])
  const { title } = resolveLegalSection(config, section, locale)
  return { title: `${title} | Nebula Noir` }
}

export async function LegalPage({ section }: { section: LegalSection }) {
  const [config, locale] = await Promise.all([getLegalConfig(), getServerLocale()])
  const { title, content } = resolveLegalSection(config, section, locale)
  return <LegalDocument section={section} title={title} content={content} />
}
