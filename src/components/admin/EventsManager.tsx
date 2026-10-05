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

type EventRow = EventItem & { published?: boolean }

function toLocalInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIso(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function readForm(data: FormData) {
  return {
    title: String(data.get('title') || ''),
    venue: String(data.get('venue') || ''),
    city: String(data.get('city') || ''),
    startsAt: toIso(String(data.get('startsAt') || '')),
    endsAt: toIso(String(data.get('endsAt') || '')),
    description: String(data.get('description') || ''),
    url: String(data.get('url') || ''),
    published: data.get('published') === 'on',
  }
}

export function EventsManager({ events, demo }: { events: EventRow[]; demo?: boolean }) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    const form = e.currentTarget
    setBusy(true)
    const result = await saveEvent(readForm(new FormData(form)))
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Event gespeichert')
    form.reset()
    router.refresh()
  }

  const onUpdate = async (e: FormEvent<HTMLFormElement>, event: EventRow) => {
    e.preventDefault()
    if (demo) {
      toast.error('Demo Mode: Speichern deaktiviert')
      return
    }
    setBusy(true)
    const result = await saveEvent({ id: event.id, ...readForm(new FormData(e.currentTarget)) })
    setBusy(false)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Event gespeichert')
      router.refresh()
    }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onCreate} className="space-y-6 border-2 border-foreground/30 bg-background/50 p-6 md:p-10">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Neues Event</h3>
        <Input name="title" required placeholder="Titel" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <Input name="venue" placeholder="Stand / Venue" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <Input name="city" placeholder="Stadt" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <Label className="text-sm uppercase tracking-[0.2em]">Start</Label>
        <Input name="startsAt" type="datetime-local" required className="rounded-none border-2 border-foreground/30 bg-background" />
        <Label className="text-sm uppercase tracking-[0.2em]">Ende</Label>
        <Input name="endsAt" type="datetime-local" className="rounded-none border-2 border-foreground/30 bg-background" />
        <Textarea name="description" placeholder="Beschreibung" className="min-h-[120px] rounded-none border-2 border-foreground/30 bg-background" />
        <Input name="url" placeholder="URL" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
          <input type="checkbox" name="published" defaultChecked /> Veröffentlicht
        </label>
        <Button
          type="submit"
          disabled={busy || demo}
          className="w-full border-2 border-foreground bg-transparent py-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background"
        >
          Speichern
        </Button>
      </form>

      <div className="space-y-4">
        {events.map((event) => (
          <article key={event.id} className="space-y-3 border-2 border-foreground/30 bg-background/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm uppercase tracking-wider">{event.title}</p>
                <p className="text-xs text-foreground/60">
                  {event.city} · {event.venue}
                  {event.published === false ? ' · unveröffentlicht' : ''}
                </p>
                <p className="text-xs text-foreground/50" suppressHydrationWarning>{toLocalInput(event.startsAt).replace('T', ' ')}</p>
              </div>
              <Button
                type="button"
                disabled={busy || demo}
                className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                onClick={async () => {
                  setBusy(true)
                  const result = await deleteEvent(event.id)
                  setBusy(false)
                  if (!result.ok) toast.error(result.error)
                  else router.refresh()
                }}
              >
                Löschen
              </Button>
            </div>
            <details className="border border-foreground/20 p-3">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.15em] text-foreground/70">Bearbeiten</summary>
              <form onSubmit={(e) => onUpdate(e, event)} className="mt-3 space-y-3">
                <Input name="title" defaultValue={event.title} placeholder="Titel" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="venue" defaultValue={event.venue} placeholder="Stand / Venue" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input name="city" defaultValue={event.city} placeholder="Stadt" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                  <Input name="startsAt" type="datetime-local" defaultValue={toLocalInput(event.startsAt)} suppressHydrationWarning className="rounded-none border-2 border-foreground/30 bg-background" />
                  <Input name="endsAt" type="datetime-local" defaultValue={toLocalInput(event.endsAt)} suppressHydrationWarning className="rounded-none border-2 border-foreground/30 bg-background" />
                </div>
                <Textarea name="description" defaultValue={event.description} placeholder="Beschreibung" className="min-h-[100px] rounded-none border-2 border-foreground/30 bg-background" />
                <Input name="url" defaultValue={event.url ?? ''} placeholder="URL" className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground" />
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <input type="checkbox" name="published" defaultChecked={event.published !== false} /> Veröffentlicht
                </label>
                <Button
                  type="submit"
                  disabled={busy || demo}
                  className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                >
                  Speichern
                </Button>
              </form>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}
