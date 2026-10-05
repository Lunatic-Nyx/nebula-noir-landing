'use client'

import { useScrollTrigger } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { ArtDecoAnimatedDivider } from './ArtDecoAnimatedDivider'
import type { BrandInfo } from '@/lib/types'
import { useT } from '@/i18n/context'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

function pick(info: Record<string, BrandInfo> | undefined, key: string, fallback: string) {
  return info?.[key]?.body ?? fallback
}

export function AboutSection({ info }: { info?: Record<string, BrandInfo> }) {
  const t = useT()
  const { ref, isVisible } = useScrollTrigger(0.1)

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden max-w-full" ref={ref} style={{ scrollMarginTop: SCROLL_OFFSET_VAR }}>
      <div className="absolute inset-0 opacity-3">
        <svg className="w-full h-full">
          <defs>
            <pattern id="bioshock-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 60 120 M 0 60 L 120 60" stroke="white" strokeWidth="0.5" fill="none" />
              <circle cx="60" cy="60" r="30" stroke="white" strokeWidth="0.5" fill="none" />
              <circle cx="60" cy="60" r="15" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M 0,0 L 30,30 M 120,0 L 90,30 M 120,120 L 90,90 M 0,120 L 30,90" stroke="white" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bioshock-pattern)" />
        </svg>
      </div>

      <motion.div 
        className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10"
        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
        animate={isVisible ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
        transition={{ duration: 1, ease: EASE_DECO }}
      >
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8 bioshock-glow-animated px-4 whitespace-pre-line">
            {t('about.title')}
          </h2>
          <ArtDecoAnimatedDivider className="max-w-md mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-24 px-4">
          <motion.div 
            className="text-center space-y-4 md:space-y-6 relative p-6 md:p-8 border-2 border-foreground/30 bg-background/50"
            initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
            animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_DECO }}
          >
            <div className="text-5xl md:text-7xl mb-4 bioshock-glow-animated" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.5)' }}>✦</div>
            <h3 className="text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.15em] md:tracking-[0.2em]">{t('about.missionTitle')}</h3>
            <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-light">
              {pick(info, 'mission', t('about.mission'))}
            </p>
          </motion.div>

          <motion.div 
            className="text-center space-y-4 md:space-y-6 relative p-6 md:p-8 border-2 border-foreground/30 bg-background/50"
            initial={{ opacity: 0, clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
            animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE_DECO }}
          >
            <div className="text-5xl md:text-7xl mb-4 text-primary bioshock-glow-animated spark-theme-moon-symbol">☾</div>
            <h3 className="text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.15em] md:tracking-[0.2em]">{t('about.identityTitle')}</h3>
            <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-light">
              {pick(info, 'identity', t('about.identity'))}
            </p>
          </motion.div>

          <motion.div 
            className="text-center space-y-4 md:space-y-6 relative p-6 md:p-8 border-2 border-foreground/30 bg-background/50"
            initial={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
            transition={{ duration: 0.6, delay: 0.6, ease: EASE_DECO }}
          >
            <div className="text-5xl md:text-7xl mb-4 bioshock-glow-animated spark-theme-moon-symbol" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.5)' }}>☾</div>
            <h3 className="text-xl md:text-2xl lg:text-3xl uppercase tracking-[0.15em] md:tracking-[0.2em]">{t('about.craftTitle')}</h3>
            <p className="text-foreground/75 leading-relaxed text-sm md:text-base font-light">
              {pick(info, 'craft', t('about.craft'))}
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="max-w-4xl mx-auto px-4"
          initial={{ opacity: 0, clipPath: 'inset(50% 50%)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0% 0%)' } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE_DECO }}
        >
          <div className="relative p-6 md:p-10 lg:p-16 border-2 border-foreground/30 bg-background/50">
            <h3 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-8 md:mb-12 text-center uppercase tracking-[0.15em] md:tracking-[0.25em] bioshock-glow-animated">{t('about.valuesTitle')}</h3>
            <ul className="space-y-6 md:space-y-8 text-sm md:text-base lg:text-lg">
              <li className="flex items-start gap-3 md:gap-4">
                <span className="text-primary text-xl md:text-2xl mt-1 flex-shrink-0 spark-theme-moon-symbol">☾</span>
                <span className="text-foreground/80 font-light">
                  <strong className="text-foreground uppercase tracking-wider">{t('about.valueCraftLabel')}:</strong> {pick(info, 'value_handwerk', t('about.valueCraft'))}
                </span>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <span className="text-primary text-xl md:text-2xl mt-1 flex-shrink-0 spark-theme-moon-symbol">☾</span>
                <span className="text-foreground/80 font-light">
                  <strong className="text-foreground uppercase tracking-wider">{t('about.valueAestheticLabel')}:</strong> {pick(info, 'value_aesthetik', t('about.valueAesthetic'))}
                </span>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <span className="text-primary text-xl md:text-2xl mt-1 flex-shrink-0 spark-theme-moon-symbol">☾</span>
                <span className="text-foreground/80 font-light">
                  <strong className="text-foreground uppercase tracking-wider">{t('about.valueIndividualLabel')}:</strong> {pick(info, 'value_individualitaet', t('about.valueIndividual'))}
                </span>
              </li>
              <li className="flex items-start gap-3 md:gap-4">
                <span className="text-primary text-xl md:text-2xl mt-1 flex-shrink-0 spark-theme-moon-symbol">☾</span>
                <span className="text-foreground/80 font-light">
                  <strong className="text-foreground uppercase tracking-wider">{t('about.valueInclusiveLabel')}:</strong> {pick(info, 'value_inklusivitaet', t('about.valueInclusive'))}
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="text-center mt-12 md:mt-20 px-4">
          <p className="text-lg md:text-xl lg:text-2xl text-foreground/60 italic font-light tracking-wide leading-relaxed max-w-3xl mx-auto">
            {`"${pick(info, 'quote', t('about.quote'))}"`}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
