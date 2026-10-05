'use client'

import { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { saveBrandInfo } from '@/lib/actions/admin'
import type { BrandInfo } from '@/lib/types'
import { useT } from '@/i18n/context'

export function InfoManager({ items, demo }: { items: BrandInfo[]; demo?: boolean }) {
  const t = useT()
  return (
    <div className="space-y-8">
      {items.map((item) => (
        <form
          key={item.key}
          className="p-6 md:p-10 space-y-4 border-2 border-foreground/30 bg-background/50"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const result = await saveBrandInfo(item.key, String(data.get('title') || ''), String(data.get('body') || ''))
            if (!result.ok) toast.error(result.error)
            else toast.success(t('admin.saved'))
          }}
        >
          <p className="text-xs uppercase tracking-wider text-foreground/50">{item.key}</p>
          <Input name="title" defaultValue={item.title} className="bg-background border-0 border-b-2 border-foreground/30 rounded-none px-0" />
          <Textarea name="body" defaultValue={item.body} className="bg-background border-2 border-foreground/30 min-h-[140px] rounded-none" />
          <Button
            type="submit"
            disabled={demo}
            className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] text-xs px-6 py-3"
          >
            {t('admin.save')}
          </Button>
        </form>
      ))}
    </div>
  )
}
