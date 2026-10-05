'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { deleteEvent, saveEvent } from '@/lib/actions/admin'
import type { EventItem } from '@/lib/types'
import { useT } from '@/i18n/context'

export function EventsManager({ events, demo }: { events: EventItem[]; demo?: boolean }) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setBusy(true)
    const result = await saveEvent({
      title: String(data.get('title') || ''),
      venue: String(data.get('venue') || ''),
      city: String(data.get('city') || ''),
      startsAt: String(data.get('startsAt') || ''),
      endsAt: String(data.get('endsAt') || ''),
      description: String(data.get('description') || ''),
      url: String(data.get('url') || ''),
      published: data.get('published') === 'on',
    })
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(t('admin.eventSaved'))
    form.reset()
    router.refresh()
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onSubmit} className="p-6 md:p-10 space-y-6 border-2 border-foreground/30 bg-background/50">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.newEvent')}</h3>
        <Input name="title" required placeholder={t('admin.titlePlaceholder')} className="bg-background border-0 border-b-2 border-foreground/30 rounded-none px-0" />
        <Input name="venue" placeholder={t('admin.venue')} className="bg-background border-0 border-b-2 border-foreground/30 rounded-none px-0" />
        <Input name="city" placeholder={t('admin.city')} className="bg-background border-0 border-b-2 border-foreground/30 rounded-none px-0" />
        <Label className="text-sm uppercase tracking-[0.2em]">{t('admin.start')}</Label>
        <Input name="startsAt" type="datetime-local" required className="bg-background border-2 border-foreground/30 rounded-none" />
        <Label className="text-sm uppercase tracking-[0.2em]">{t('admin.end')}</Label>
        <Input name="endsAt" type="datetime-local" className="bg-background border-2 border-foreground/30 rounded-none" />
        <Textarea name="description" placeholder={t('admin.descriptionPlaceholder')} className="bg-background border-2 border-foreground/30 min-h-[120px] rounded-none" />
        <Input name="url" placeholder={t('admin.urlPlaceholder')} className="bg-background border-0 border-b-2 border-foreground/30 rounded-none px-0" />
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
          <input type="checkbox" name="published" defaultChecked /> {t('admin.published')}
        </label>
        <Button
          type="submit"
          disabled={busy || demo}
          className="w-full bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] font-semibold py-4 text-sm"
        >
          {t('admin.save')}
        </Button>
      </form>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border-2 border-foreground/30 p-6 flex justify-between gap-4">
            <div>
              <p className="uppercase tracking-wider">{event.title}</p>
              <p className="text-sm text-foreground/70">{event.city} · {event.venue}</p>
            </div>
            <Button
              type="button"
              className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] text-xs"
              onClick={async () => {
                const result = await deleteEvent(event.id)
                if (!result.ok) toast.error(result.error)
                else router.refresh()
              }}
              >
                {t('admin.delete')}
              </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
