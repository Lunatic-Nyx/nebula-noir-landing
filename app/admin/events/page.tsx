import { EventsManager } from '@/components/admin/EventsManager'
import { getEvents } from '@/lib/data'
import { isDemoMode } from '@/lib/env'
import { getServerT } from '@/i18n/server'

export default async function AdminEventsPage() {
  const t = await getServerT()
  const events = await getEvents()
  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.events')}</h2>
      <EventsManager events={events} demo={isDemoMode()} />
    </div>
  )
}
