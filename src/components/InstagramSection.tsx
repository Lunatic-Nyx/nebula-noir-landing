'use client'

import { useScrollTrigger } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { ArtDecoCorner } from './ArtDecoCorner'
import type { InstagramPost } from '@/lib/types'
import { useT } from '@/i18n/context'
import { useSiteConfig } from '@/components/SiteConfigProvider'
import { IMAGE_FILTER, SCROLL_OFFSET_VAR } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

export function InstagramSection({ posts }: { posts: InstagramPost[] }) {
  const t = useT()
  const siteConfig = useSiteConfig()
  const { ref, isVisible } = useScrollTrigger(0.1)
  if (!posts.length) return null

  return (
    <section id="instagram" className="py-24 md:py-32 relative overflow-hidden max-w-full" ref={ref} style={{ scrollMarginTop: SCROLL_OFFSET_VAR }}>
      <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: EASE_DECO }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8 bioshock-glow-animated uppercase tracking-[0.2em] md:tracking-[0.25em] px-4">
            {t('instagram.title')}
          </h2>
          <div className="art-deco-divider max-w-md mx-auto!" />
          <p className="text-sm md:text-base lg:text-lg text-foreground/70 mt-6 md:mt-10 max-w-2xl mx-auto font-light leading-relaxed px-4">
            {t('instagram.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: EASE_DECO }}
            >
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-card transition-all duration-500 nebula-glow-hover overflow-hidden metallic-border cursor-pointer art-deco-card-hover spark-theme-card-wrapper block"
              >
                <div className="spark-theme-card-corners" />
                <ArtDecoCorner position="top-left" size={40} delay={0} />
                <ArtDecoCorner position="bottom-right" size={40} delay={0.1} />
                <div className="aspect-square overflow-hidden bg-muted relative" style={{ filter: IMAGE_FILTER }}>
                  <img
                    src={post.thumbnailUrl || post.mediaUrl}
                    alt={post.caption || 'Instagram'}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 md:p-6 space-y-3 md:space-y-4 relative z-10">
                  <p className="text-xs md:text-sm text-foreground/70 leading-relaxed font-light line-clamp-2">
                    {post.caption || '@nebula_noir.official'}
                  </p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12 md:mt-16 px-4">
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider"
          >
            @nebula_noir.official
          </a>
        </div>
      </div>
    </section>
  )
}
