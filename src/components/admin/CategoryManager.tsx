'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { deleteCategory, reassignCategory, saveCategory } from '@/lib/actions/categories'
import type { Category } from '@/lib/types'

export function CategoryManager({
  categories,
  demo,
}: {
  categories: Category[]
  demo?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [reassignFor, setReassignFor] = useState<string | null>(null)
  const [reassignTarget, setReassignTarget] = useState('')
  const router = useRouter()

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    setBusy(true)
    const result = await saveCategory({
      slug: String(data.get('slug') || ''),
      label: String(data.get('label') || ''),
      labelEn: String(data.get('labelEn') || ''),
      sortOrder: Number(data.get('sortOrder') || 0),
    })
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Kategorie angelegt')
      form.reset()
      router.refresh()
    }
  }

  const onUpdate = async (e: FormEvent<HTMLFormElement>, category: Category) => {
    e.preventDefault()
    if (demo || !category.id) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    const data = new FormData(e.currentTarget)
    setBusy(true)
    const result = await saveCategory({
      id: category.id,
      slug: category.slug,
      label: String(data.get('label') || ''),
      labelEn: String(data.get('labelEn') || ''),
      sortOrder: Number(data.get('sortOrder') || 0),
    })
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Gespeichert')
      router.refresh()
    }
  }

  const onDelete = async (category: Category) => {
    if (!category.id) return
    setBusy(true)
    const result = await deleteCategory(category.id)
    setBusy(false)
    if (result.ok) {
      toast.success('Kategorie gelöscht')
      router.refresh()
      return
    }
    toast.error(result.error)
    if (result.count) {
      setReassignFor(category.id)
      setReassignTarget(categories.find((item) => item.id !== category.id)?.id ?? '')
    }
  }

  const onReassign = async (fromId: string) => {
    if (!reassignTarget) {
      toast.error('Ziel-Kategorie wählen')
      return
    }
    setBusy(true)
    const result = await reassignCategory(fromId, reassignTarget)
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Bilder verschoben — Kategorie kann jetzt gelöscht werden')
    setReassignFor(null)
    router.refresh()
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onCreate} className="space-y-6 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Neue Kategorie</h3>
        <p className="text-xs text-foreground/60">
          Der Slug ist die technische Kennung (a-z, 0-9, Bindestrich) und nach dem Anlegen unveränderlich.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Slug</Label>
            <Input name="slug" required placeholder="harnesses" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Label (DE)</Label>
            <Input name="label" required placeholder="Harnesse" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Label (EN)</Label>
            <Input name="labelEn" placeholder="Harnesses" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-sm uppercase tracking-[0.2em]">Sortierung</Label>
            <Input name="sortOrder" type="number" defaultValue={categories.length + 1} className="rounded-none border-2 border-foreground/30 bg-background" />
          </div>
        </div>
        <Button type="submit" disabled={busy} className="border-2 border-foreground bg-transparent px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background">
          Anlegen
        </Button>
      </form>

      <div className="space-y-4">
        {categories.map((category) => (
          <article key={category.id ?? category.slug} className="space-y-3 border-2 border-foreground/30 bg-background/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.15em]">
                {category.label} <span className="text-foreground/50">/ {category.labelEn || '—'}</span>
              </p>
              <code className="text-xs text-foreground/50">{category.slug} · #{category.sortOrder ?? 0}</code>
            </div>
            <details className="border border-foreground/20 p-3">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.15em] text-foreground/70">Bearbeiten</summary>
              <form onSubmit={(e) => onUpdate(e, category)} className="mt-3 space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input name="label" defaultValue={category.label} placeholder="Label DE" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input name="labelEn" defaultValue={category.labelEn} placeholder="Label EN" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input name="sortOrder" type="number" defaultValue={category.sortOrder ?? 0} className="rounded-none border-2 border-foreground/30 bg-background" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy || demo} className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background">
                    Speichern
                  </Button>
                  <Button type="button" disabled={busy || demo} onClick={() => onDelete(category)} className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background">
                    Löschen
                  </Button>
                </div>
              </form>
            </details>
            {reassignFor === category.id ? (
              <div className="flex flex-wrap items-end gap-3 border border-foreground/30 p-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.15em] text-foreground/70">Bilder verschieben nach</Label>
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    className="border-2 border-foreground/30 bg-background px-2 py-2 text-xs uppercase tracking-wider text-foreground"
                  >
                    {categories
                      .filter((item) => item.id && item.id !== category.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                  </select>
                </div>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => category.id && onReassign(category.id)}
                  className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                >
                  Verschieben
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}
