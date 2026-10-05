'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { deleteGalleryImage, updateGalleryMeta } from '@/lib/actions/admin'
import { CATEGORIES } from '@/lib/products'
import type { GalleryItem } from '@/lib/types'
import { useT } from '@/i18n/context'

type Row = GalleryItem & { published?: boolean; sortOrder?: number }

export function GalleryManager({ items, demo }: { items: Row[]; demo?: boolean }) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const onUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      toast.error(t('admin.uploadDisabled'))
      return
    }
    const form = e.currentTarget
    const data = new FormData(form)
    setBusy(true)
    const res = await fetch('/api/gallery/upload', { method: 'POST', body: data })
    const json = await res.json()
    setBusy(false)
    if (!res.ok) {
      toast.error(json.error || t('admin.uploadFailed'))
      return
    }
    toast.success(t('admin.uploadOk'))
    form.reset()
    router.refresh()
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onUpload} className="relative p-6 md:p-10 space-y-6 border-2 border-foreground/30 bg-background/50">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.upload')}</h3>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">{t('admin.file')}</Label>
          <Input name="file" type="file" accept="image/*" required className="bg-background border-2 border-foreground/30 rounded-none" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">{t('admin.titleLabel')}</Label>
          <Input name="title" required className="bg-background border-0 border-b-2 border-foreground/30 focus:border-foreground rounded-none px-0" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">{t('admin.descriptionLabel')}</Label>
          <Input name="description" className="bg-background border-0 border-b-2 border-foreground/30 focus:border-foreground rounded-none px-0" />
        </div>
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-[0.2em] text-foreground/90">{t('admin.categoryLabel')}</Label>
          <select
            name="category"
            className="w-full bg-background border-2 border-foreground/30 text-foreground px-3 py-2 uppercase tracking-wider text-sm"
            defaultValue="chokers"
          >
            {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
              <option key={c.value} value={c.value}>
                {t(`categories.${c.value}`)}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="w-full bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] font-semibold py-4 text-sm transition-all duration-500"
        >
          {busy ? t('admin.uploading') : t('admin.uploadAction')}
        </Button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article key={item.id} className="border-2 border-foreground/30 bg-background/50 p-4 space-y-3">
            <img src={item.image} alt={item.alt || item.name} className="w-full aspect-square object-cover" />
            <p className="uppercase tracking-wider text-sm">{item.name}</p>
            <p className="text-xs text-foreground/60">{item.category}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] text-xs"
                onClick={async () => {
                  const title = window.prompt(t('admin.titleLabel'), item.name)
                  if (!title) return
                  const result = await updateGalleryMeta(item.id, {
                    title,
                    description: item.description,
                    published: item.published !== false,
                    sortOrder: item.sortOrder ?? 0,
                  })
                  if (!result.ok) toast.error(result.error)
                  else router.refresh()
                }}
              >
                {t('admin.edit')}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] text-xs"
                onClick={async () => {
                  const result = await deleteGalleryImage(item.id)
                  if (!result.ok) toast.error(result.error)
                  else router.refresh()
                }}
              >
                {t('admin.delete')}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
