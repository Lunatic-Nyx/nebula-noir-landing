import { EventsManager } from '@/components/admin/EventsManager'
import { getEvents } from '@/lib/data'
import { isDemoMode } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import type { EventItem } from '@/lib/types'

type AdminEventItem = EventItem & { published?: boolean }

export default async function AdminEventsPage() {
  const demo = isDemoMode()
  let events: AdminEventItem[] = await getEvents()

  if (!demo) {
    const supabase = await createServerSupabase()
    if (supabase) {
      // Admin sees every event, including unpublished drafts.
      const { data } = await supabase
        .from('events')
        .select('id, title, venue, city, starts_at, ends_at, description, url, published')
        .order('starts_at', { ascending: false })
      if (data) {
        events = data.map((row) => ({
          id: row.id as string,
          title: row.title as string,
          venue: (row.venue as string) || '',
          city: (row.city as string) || '',
          startsAt: row.starts_at as string,
          endsAt: (row.ends_at as string) || null,
          description: (row.description as string) || '',
          url: (row.url as string) || null,
          published: row.published as boolean,
        }))
      }
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">Events</h2>
      <EventsManager events={events} demo={demo} />
    </div>
  )
}
