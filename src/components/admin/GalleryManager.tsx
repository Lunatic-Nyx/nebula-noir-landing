'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { deleteGalleryImage, updateGalleryMeta } from '@/lib/actions/admin'
import type { Category, GalleryItem } from '@/lib/types'

type Row = GalleryItem & { published?: boolean; sortOrder?: number }

export function GalleryManager({
  items,
  categories,
  demo,
}: {
  items: Row[]
  categories: Category[]
  demo?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const onUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Upload deaktiviert')
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    setBusy(true)
    const res = await fetch('/api/gallery/upload', { method: 'POST', body: data })
    const json = await res.json()
    setBusy(false)
    if (!res.ok) {
      toast.error(json.error || 'Upload fehlgeschlagen')
      return
    }
    toast.success('Bild gespeichert')
    form.reset()
    router.refresh()
  }

  const onSave = async (e: FormEvent<HTMLFormElement>, item: Row) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    const data = new FormData(e.currentTarget)
    const result = await updateGalleryMeta(item.id, {
      title: String(data.get('title') || ''),
      description: String(data.get('description') || ''),
      notice: String(data.get('notice') || ''),
      published: data.get('published') === 'on',
      sortOrder: Number(data.get('sortOrder') || 0),
      category: String(data.get('category') || '') || undefined,
    })
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Gespeichert')
      router.refresh()
    }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onUpload} className="relative space-y-6 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Upload</h3>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">Datei</Label>
          <Input name="file" type="file" accept="image/*" required className="rounded-none border-2 border-foreground/30 bg-background" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">Titel</Label>
          <Input name="title" required className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">Beschreibung</Label>
          <Input name="description" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">Produkthinweis (optional)</Label>
          <Input name="notice" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">Kategorie</Label>
          <select
            name="category"
            className="w-full border-2 border-foreground/30 bg-background px-3 py-2 text-sm uppercase tracking-wider text-foreground"
            defaultValue={categories[0]?.slug ?? ''}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="w-full border-2 border-foreground bg-transparent py-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition-all duration-500 hover:bg-foreground hover:text-background"
        >
          {busy ? 'Lädt…' : 'Hochladen'}
        </Button>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="space-y-3 border-2 border-foreground/30 bg-background/50 p-4">
            <img src={item.image} alt={item.alt || item.name} className="aspect-square w-full object-cover" />
            <p className="break-words text-sm uppercase tracking-wider">{item.name}</p>
            <p className="text-xs text-foreground/60">
              {item.category}
              {item.published === false ? ' · unveröffentlicht' : ''}
            </p>
            <details className="border border-foreground/20 p-3">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.15em] text-foreground/70">
                Bearbeiten
              </summary>
              <form onSubmit={(e) => onSave(e, item)} className="mt-3 space-y-3">
                <Input name="title" defaultValue={item.name} placeholder="Titel" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                <Textarea name="description" defaultValue={item.description} placeholder="Beschreibung" className="min-h-[80px] rounded-none border-2 border-foreground/30 bg-background" />
                <Textarea name="notice" defaultValue={item.notice} placeholder="Produkthinweis (optional)" className="min-h-[60px] rounded-none border-2 border-foreground/30 bg-background" />
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] text-foreground/70">Kategorie</Label>
                  <select
                    name="category"
                    defaultValue={item.category}
                    className="w-full border-2 border-foreground/30 bg-background px-2 py-2 text-xs uppercase tracking-wider text-foreground"
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] text-foreground/70">Sortierung</Label>
                  <Input name="sortOrder" type="number" defaultValue={item.sortOrder ?? 0} className="rounded-none border-2 border-foreground/30 bg-background" />
                </div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <input type="checkbox" name="published" defaultChecked={item.published !== false} /> Veröffentlicht
                </label>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 border-2 border-foreground bg-transparent text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                  >
                    Speichern
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 border-2 border-foreground bg-transparent text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                    onClick={async () => {
                      const result = await deleteGalleryImage(item.id)
                      if (!result.ok) toast.error(result.error)
                      else router.refresh()
                    }}
                  >
                    Löschen
                  </Button>
                </div>
              </form>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}
