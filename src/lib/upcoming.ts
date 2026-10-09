const DAY_MS = 86_400_000

// No end time: keep the event through the next day so a club night does not
// vanish at the start minute. A date that does not parse is hidden.
export function isUpcomingEvent(
  event: { startsAt: string; endsAt?: string | null },
  now = Date.now(),
): boolean {
  const start = Date.parse(event.startsAt)
  const end = event.endsAt ? Date.parse(event.endsAt) : start + DAY_MS
  return Number.isFinite(end) && end >= now
}
