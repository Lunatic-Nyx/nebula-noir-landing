'use client'

import { LEGAL_CONTENT, LegalSection } from '@/lib/legal-content'
import { SiteChrome } from '@/components/SiteChrome'
import { BackButton } from '@/components/BackButton'
import { useI18n, useT } from '@/i18n/context'

const TITLE_KEY: Record<LegalSection, string> = {
  impressum: 'footer.impressum',
  datenschutz: 'footer.privacy',
  agb: 'footer.terms',
  widerruf: 'footer.withdrawal',
  versand: 'footer.shipping',
  customOrders: 'footer.customOrders',
  about: 'footer.about',
}

export function LegalDocument({
  section,
  title,
  titleDe,
  titleEn,
  content,
}: {
  section: LegalSection
  title?: string
  titleDe?: string
  titleEn?: string
  content?: string
}) {
  const t = useT()
  const { locale } = useI18n()
  const localizedTitle = locale === 'en' ? titleEn : titleDe
  const resolvedTitle = localizedTitle || title || t(TITLE_KEY[section])
  const html = content ?? LEGAL_CONTENT[section].content

  return (
    <SiteChrome>
      <section className="pt-36 md:pt-48 pb-16 md:pb-24">
        <div className="container max-w-4xl mx-auto px-4 md:px-6">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="p-0 bg-background border-2 border-foreground/30 flex flex-col overflow-hidden">
            <div className="p-8 pb-4 border-b border-foreground/20">
              <h1 className="text-3xl md:text-4xl uppercase tracking-[0.2em] bioshock-glow-animated whitespace-pre-line break-words">
                {resolvedTitle}
              </h1>
            </div>
            <div className="px-8 pb-8 pt-6">
              <div
                className="legal-content prose prose-invert max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
