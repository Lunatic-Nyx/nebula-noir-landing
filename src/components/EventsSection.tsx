'use client'

import { useScrollTrigger } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { ArtDecoAnimatedDivider } from './ArtDecoAnimatedDivider'
import type { EventItem } from '@/lib/types'
import { useI18n, useT } from '@/i18n/context'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

function formatRange(start: string, end: string | null | undefined, locale: string) {
  const tag = locale === 'en' ? 'en-GB' : 'de-DE'
  const s = new Date(start)
  const startLabel = s.toLocaleDateString(tag, { day: '2-digit', month: 'short', year: 'numeric' })
  if (!end) return startLabel
  const e = new Date(end)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) {
    const time: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    return `${startLabel} · ${s.toLocaleTimeString(tag, time)} – ${e.toLocaleTimeString(tag, time)}`
  }
  return `${startLabel} – ${e.toLocaleDateString(tag, { day: '2-digit', month: 'short', year: 'numeric' })}`
}

export function EventsSection({ events }: { events: EventItem[] }) {
  const t = useT()
  const { locale } = useI18n()
  const { ref, isVisible } = useScrollTrigger(0.1)
  if (!events.length) return null

  return (
    <section id="events" className="py-24 md:py-32 relative overflow-hidden max-w-full" ref={ref} style={{ scrollMarginTop: SCROLL_OFFSET_VAR }}>
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: EASE_DECO }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8 bioshock-glow-animated uppercase tracking-[0.2em] md:tracking-[0.25em] px-4 whitespace-pre-line">
            {t('events.title')}
          </h2>
          <ArtDecoAnimatedDivider className="max-w-md mx-auto" />
          <p className="text-sm md:text-base lg:text-lg text-foreground/70 mt-6 md:mt-10 max-w-2xl mx-auto font-light leading-relaxed px-4">
            {t('events.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 px-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className="text-center space-y-4 md:space-y-6 relative p-6 md:p-8 border-2 border-foreground/30 bg-background/50"
              initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: EASE_DECO }}
            >
              <div className="text-5xl md:text-7xl mb-4 bioshock-glow-animated spark-theme-moon-symbol" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.5)' }}>☾</div>
              <h3 className="text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.15em] md:tracking-[0.2em]">{event.title}</h3>
              <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-light">
                {event.venue}{event.city ? ` · ${event.city}` : ''}
              </p>
              <p className="text-xs md:text-sm uppercase tracking-wider text-foreground/60">
                {formatRange(event.startsAt, event.endsAt, locale)}
              </p>
              <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-light">
                {event.description}
              </p>
              {event.url ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider"
                >
                  {t('events.details')}
                </a>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
