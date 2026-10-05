'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { deleteBrandInfo, saveBrandInfo } from '@/lib/actions/admin'
import type { BrandInfo } from '@/lib/types'
import { useT } from '@/i18n/context'

export function InfoManager({ items, demo }: { items: BrandInfo[]; demo?: boolean }) {
  const t = useT()
  const router = useRouter()

  const save = async (e: FormEvent<HTMLFormElement>, key: string) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = await saveBrandInfo(key, String(data.get('title') || ''), String(data.get('body') || ''))
    if (!result.ok) toast.error(result.error)
    else {
      toast.success(t('admin.saved'))
      router.refresh()
    }
  }

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    const key = String(data.get('key') || '').trim()
    if (!key) return
    const result = await saveBrandInfo(key, String(data.get('title') || ''), String(data.get('body') || ''))
    if (!result.ok) toast.error(result.error)
    else {
      toast.success(t('admin.saved'))
      form.reset()
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="space-y-4 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Neuer Eintrag</h3>
        <p className="text-xs text-foreground/60">
          Der Key steuert, wo der Text erscheint (z. B. <code>mission</code>, <code>quote</code>).
        </p>
        <Input name="key" required placeholder="key" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <Input name="title" required placeholder="Titel" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <Textarea name="body" required placeholder="Text" className="min-h-[100px] rounded-none border-2 border-foreground/30 bg-background" />
        <Button type="submit" disabled={demo} className="border-2 border-foreground bg-transparent px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background">
          Anlegen
        </Button>
      </form>

      {items.map((item) => (
        <form
          key={item.key}
          className="space-y-4 border-2 border-foreground/30 bg-background/50 p-6 md:p-10"
          onSubmit={(e) => save(e, item.key)}
        >
          <p className="text-xs uppercase tracking-wider text-foreground/50">{item.key}</p>
          <Input name="title" defaultValue={item.title} className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0" />
          <Textarea name="body" defaultValue={item.body} className="min-h-[140px] rounded-none border-2 border-foreground/30 bg-background" />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={demo}
              className="border-2 border-foreground bg-transparent px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background"
            >
              {t('admin.save')}
            </Button>
            <Button
              type="button"
              disabled={demo}
              className="border-2 border-foreground/40 bg-transparent px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:bg-foreground hover:text-background"
              onClick={async () => {
                const result = await deleteBrandInfo(item.key)
                if (!result.ok) toast.error(result.error)
                else router.refresh()
              }}
            >
              Löschen
            </Button>
          </div>
        </form>
      ))}
    </div>
  )
}
