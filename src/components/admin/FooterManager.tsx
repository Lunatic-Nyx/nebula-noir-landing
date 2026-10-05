'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveFooterConfig } from '@/lib/actions/content'
import type { FooterColumnConfig, FooterConfig, FooterLinkConfig } from '@/lib/site-config.types'

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = [...list]
  const target = index + direction
  if (target < 0 || target >= next.length) return next
  const current = next[index]
  next[index] = next[target]
  next[target] = current
  return next
}

const smallButton =
  'border-2 border-foreground/30 bg-transparent px-3 py-1 text-xs uppercase tracking-[0.1em] text-foreground/80 transition-all duration-300 hover:bg-foreground hover:text-background disabled:opacity-40'

export function FooterManager({ config }: { config: FooterConfig }) {
  const [footer, setFooter] = useState<FooterConfig>(config)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const setColumns = (columns: FooterColumnConfig[]) => setFooter((prev) => ({ ...prev, columns }))

  const updateColumn = (index: number, patch: Partial<FooterColumnConfig>) => {
    setColumns(footer.columns.map((column, i) => (i === index ? { ...column, ...patch } : column)))
  }

  const updateLink = (ci: number, li: number, patch: Partial<FooterLinkConfig>) => {
    setColumns(
      footer.columns.map((column, i) =>
        i === ci
          ? { ...column, links: column.links.map((link, j) => (j === li ? { ...link, ...patch } : link)) }
          : column
      )
    )
  }

  const save = async () => {
    setBusy(true)
    const result = await saveFooterConfig(footer)
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Footer gespeichert')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-foreground/70">
        Spalten, Links, Texte und Reihenfolge des Footers. Links ohne URL werden beim Speichern
        verworfen; externe URLs (http…) öffnen in einem neuen Tab.
      </p>

      <div className="space-y-4 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Marken-Text</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={footer.blurb.de} onChange={(e) => setFooter({ ...footer, blurb: { ...footer.blurb, de: e.target.value } })} placeholder="Blurb DE" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          <Input value={footer.blurb.en} onChange={(e) => setFooter({ ...footer, blurb: { ...footer.blurb, en: e.target.value } })} placeholder="Blurb EN" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        </div>
      </div>

      <div className="space-y-6">
        {footer.columns.map((column, ci) => (
          <div key={ci} className="space-y-4 border-2 border-foreground/30 bg-background/50 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid flex-1 gap-3 md:grid-cols-2">
                <Input value={column.title.de} onChange={(e) => updateColumn(ci, { title: { ...column.title, de: e.target.value } })} placeholder="Spalten-Titel DE" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                <Input value={column.title.en} onChange={(e) => updateColumn(ci, { title: { ...column.title, en: e.target.value } })} placeholder="Spalten-Titel EN" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
              </div>
              <div className="flex gap-2">
                <button type="button" className={smallButton} onClick={() => setColumns(move(footer.columns, ci, -1))} aria-label="Spalte nach oben">↑</button>
                <button type="button" className={smallButton} onClick={() => setColumns(move(footer.columns, ci, 1))} aria-label="Spalte nach unten">↓</button>
                <button type="button" className={smallButton} onClick={() => setColumns(footer.columns.filter((_, i) => i !== ci))} aria-label="Spalte löschen">✕</button>
              </div>
            </div>

            <div className="space-y-3">
              {column.links.map((link, li) => (
                <div key={li} className="grid gap-3 border border-foreground/20 p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                  <Input value={link.label.de} onChange={(e) => updateLink(ci, li, { label: { ...link.label, de: e.target.value } })} placeholder="Label DE" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input value={link.label.en} onChange={(e) => updateLink(ci, li, { label: { ...link.label, en: e.target.value } })} placeholder="Label EN" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input value={link.href} onChange={(e) => updateLink(ci, li, { href: e.target.value })} placeholder="/pfad oder https://…" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <div className="flex gap-2">
                    <button type="button" className={smallButton} onClick={() => updateColumn(ci, { links: move(column.links, li, -1) })} aria-label="Link nach oben">↑</button>
                    <button type="button" className={smallButton} onClick={() => updateColumn(ci, { links: move(column.links, li, 1) })} aria-label="Link nach unten">↓</button>
                    <button type="button" className={smallButton} onClick={() => updateColumn(ci, { links: column.links.filter((_, j) => j !== li) })} aria-label="Link löschen">✕</button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                className={smallButton}
                onClick={() => updateColumn(ci, { links: [...column.links, { label: { de: '', en: '' }, href: '' }] })}
              >
                + Link
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          className={smallButton}
          onClick={() => setColumns([...footer.columns, { title: { de: '', en: '' }, links: [] }])}
        >
          + Spalte
        </Button>
      </div>

      <div className="space-y-4 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Untere Zeile</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={footer.copyright.de} onChange={(e) => setFooter({ ...footer, copyright: { ...footer.copyright, de: e.target.value } })} placeholder="Copyright DE ({year})" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          <Input value={footer.copyright.en} onChange={(e) => setFooter({ ...footer, copyright: { ...footer.copyright, en: e.target.value } })} placeholder="Copyright EN ({year})" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          <Input value={footer.madeIn.de} onChange={(e) => setFooter({ ...footer, madeIn: { ...footer.madeIn, de: e.target.value } })} placeholder="Made in DE" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          <Input value={footer.madeIn.en} onChange={(e) => setFooter({ ...footer, madeIn: { ...footer.madeIn, en: e.target.value } })} placeholder="Made in EN" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" disabled={busy} onClick={save} className="border-2 border-foreground bg-transparent px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background">
          Footer speichern
        </Button>
        <button type="button" className={smallButton} onClick={() => setFooter(config)}>
          Zurücksetzen
        </button>
      </div>
    </div>
  )
}
