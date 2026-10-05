'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MESSAGE_PATHS } from '@/i18n/paths'
import type { TranslationOverrides } from '@/i18n/paths'
import { defaultMessage } from '@/i18n/translate'
import { saveLegalConfig, saveSiteConfig, saveTranslations } from '@/lib/actions/content'
import type { PublicSiteConfig } from '@/lib/site-config.types'
import type { LegalConfig } from '@/lib/legal-config.types'
import type { LegalSection } from '@/lib/legal-content'

type Tab = 'site' | 'translations' | 'legal'

const SECTION_LABELS: Record<LegalSection, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  agb: 'AGB',
  widerruf: 'Widerruf',
  versand: 'Versand',
  customOrders: 'Custom Orders',
  about: 'Über uns',
}

export function ContentManager({
  siteConfig,
  overrides,
  legalConfig,
}: {
  siteConfig: PublicSiteConfig
  overrides: TranslationOverrides
  legalConfig: LegalConfig
}) {
  const [tab, setTab] = useState<Tab>('site')
  const [busy, setBusy] = useState(false)

  const [site, setSite] = useState<PublicSiteConfig>(siteConfig)
  const [legal, setLegal] = useState<LegalConfig>(legalConfig)
  const [translations, setTranslations] = useState<Record<string, { de: string; en: string }>>(() => {
    const state: Record<string, { de: string; en: string }> = {}
    for (const path of MESSAGE_PATHS) {
      state[path] = { de: overrides.de?.[path as never] ?? '', en: overrides.en?.[path as never] ?? '' }
    }
    return state
  })

  const groups = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const path of MESSAGE_PATHS) {
      const prefix = path.split('.')[0]
      const list = map.get(prefix) ?? []
      list.push(path)
      map.set(prefix, list)
    }
    return Array.from(map.entries())
  }, [])

  const legalPlaceholders = useMemo(() => {
    const text = JSON.stringify(legal)
    return text.includes('[[')
  }, [legal])

  async function saveSite() {
    setBusy(true)
    const result = await saveSiteConfig(site)
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else toast.success('Website-Einstellungen gespeichert')
  }

  async function saveTranslationsForm() {
    setBusy(true)
    const payload: Record<string, Record<string, string>> = { de: {}, en: {} }
    for (const [path, value] of Object.entries(translations)) {
      if (value.de.trim()) payload.de[path] = value.de
      if (value.en.trim()) payload.en[path] = value.en
    }
    const result = await saveTranslations(payload)
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else toast.success('Übersetzungen gespeichert')
  }

  async function saveLegal() {
    setBusy(true)
    const result = await saveLegalConfig(legal)
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else toast.success('Rechtstexte gespeichert')
  }

  const tabClass = (value: Tab) =>
    `min-h-[44px] px-4 text-sm uppercase tracking-[0.15em] border-2 transition-all duration-300 ${
      tab === value
        ? 'border-foreground bg-foreground text-background'
        : 'border-foreground/30 text-foreground/80 hover:border-foreground'
    }`

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">Texte &amp; Übersetzungen</h2>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass('site')} onClick={() => setTab('site')}>
          Website
        </button>
        <button type="button" className={tabClass('translations')} onClick={() => setTab('translations')}>
          Übersetzungen
        </button>
        <button type="button" className={tabClass('legal')} onClick={() => setTab('legal')}>
          Rechtstexte
        </button>
      </div>

      {tab === 'site' ? (
        <div className="space-y-6 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
          <p className="text-sm text-foreground/70">
            Links und Kontaktadresse der Website. Leere Felder fallen auf den Standard zurück.
          </p>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Etsy-Shop-URL</Label>
            <Input value={site.etsyUrl} onChange={(e) => setSite({ ...site, etsyUrl: e.target.value })} className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Instagram-URL</Label>
            <Input value={site.instagramUrl} onChange={(e) => setSite({ ...site, instagramUrl: e.target.value })} className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Kontakt-E-Mail</Label>
            <Input value={site.contactEmail} onChange={(e) => setSite({ ...site, contactEmail: e.target.value })} className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground" />
          </div>
          <Button type="button" disabled={busy} onClick={saveSite} className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] text-xs px-6 py-3">
            Speichern
          </Button>
        </div>
      ) : null}

      {tab === 'translations' ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground/70">
            Überschreibt die Standardtexte der Website (DE/EN). Leer lassen = Standard. Platzhalter zeigt den Standardtext.
          </p>
          {groups.map(([prefix, paths]) => (
            <details key={prefix} className="border-2 border-foreground/30 bg-background/50">
              <summary className="cursor-pointer px-4 py-3 text-sm uppercase tracking-[0.2em]">{prefix}</summary>
              <div className="space-y-4 px-4 pb-6">
                {paths.map((path) => (
                  <div key={path} className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
                    <code className="pt-2 text-xs text-foreground/60 break-all">{path}</code>
                    <Input
                      value={translations[path]?.de ?? ''}
                      placeholder={defaultMessage('de', path)}
                      onChange={(e) => setTranslations({ ...translations, [path]: { ...(translations[path] ?? { de: '', en: '' }), de: e.target.value } })}
                      className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground"
                    />
                    <Input
                      value={translations[path]?.en ?? ''}
                      placeholder={defaultMessage('en', path)}
                      onChange={(e) => setTranslations({ ...translations, [path]: { ...(translations[path] ?? { de: '', en: '' }), en: e.target.value } })}
                      className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground"
                    />
                  </div>
                ))}
              </div>
            </details>
          ))}
          <Button type="button" disabled={busy} onClick={saveTranslationsForm} className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] text-xs px-6 py-3">
            Übersetzungen speichern
          </Button>
        </div>
      ) : null}

      {tab === 'legal' ? (
        <div className="space-y-6">
          <p className="text-sm text-foreground/70">
            Inhalte der Rechtsseiten. HTML erlaubt. Leere Felder fallen auf den Standard zurück.
          </p>
          {legalPlaceholders ? (
            <div className="border border-foreground/40 bg-primary/10 p-4 text-sm text-foreground/80">
              <strong>Pflichtangaben fehlen:</strong> Die Rechtstexte enthalten noch mit{' '}
              <code>[[…]]</code> markierte Platzhalter (u. a. Betreibername und Anschrift). Diese
              müssen vor dem Livegang eingetragen werden.
            </div>
          ) : null}
          {(Object.keys(SECTION_LABELS) as LegalSection[]).map((section) => (
            <details key={section} className="border-2 border-foreground/30 bg-background/50">
              <summary className="cursor-pointer px-4 py-3 text-sm uppercase tracking-[0.2em]">{SECTION_LABELS[section]}</summary>
              <div className="space-y-4 px-4 pb-6">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={legal[section]?.title?.de ?? ''}
                    placeholder="Titel DE"
                    onChange={(e) => setLegal({ ...legal, [section]: { ...legal[section], title: { ...legal[section].title, de: e.target.value } } })}
                    className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground"
                  />
                  <Input
                    value={legal[section]?.title?.en ?? ''}
                    placeholder="Titel EN"
                    onChange={(e) => setLegal({ ...legal, [section]: { ...legal[section], title: { ...legal[section].title, en: e.target.value } } })}
                    className="rounded-none border-0 border-b-2 border-foreground/30 px-0 focus:border-foreground"
                  />
                </div>
                <Textarea
                  value={legal[section]?.content?.de ?? ''}
                  placeholder="Inhalt DE (HTML)"
                  onChange={(e) => setLegal({ ...legal, [section]: { ...legal[section], content: { ...legal[section].content, de: e.target.value } } })}
                  className="min-h-[200px] rounded-none border-2 border-foreground/30"
                />
                <Textarea
                  value={legal[section]?.content?.en ?? ''}
                  placeholder="Inhalt EN (HTML, optional)"
                  onChange={(e) => setLegal({ ...legal, [section]: { ...legal[section], content: { ...legal[section].content, en: e.target.value } } })}
                  className="min-h-[200px] rounded-none border-2 border-foreground/30"
                />
              </div>
            </details>
          ))}
          <Button type="button" disabled={busy} onClick={saveLegal} className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] text-xs px-6 py-3">
            Rechtstexte speichern
          </Button>
        </div>
      ) : null}
    </div>
  )
}
