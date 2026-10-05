'use client'

import { HeroVideoBackground } from './HeroVideoBackground'
import { useT } from '@/i18n/context'

export function HeroSection({ videoUrl }: { videoUrl?: string }) {
  const t = useT()
  return (
    <section className="relative nn-hero flex items-center justify-center overflow-hidden max-w-full">
      <HeroVideoBackground src={videoUrl} />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="art-deco-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 50,0 L 50,100 M 0,50 L 100,50" stroke="white" strokeWidth="0.5" fill="none"/>
                <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="0.5" fill="none"/>
                <path d="M 0,0 L 25,25 M 100,0 L 75,25 M 100,100 L 75,75 M 0,100 L 25,75" stroke="white" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#art-deco-pattern)"/>
          </svg>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
        <div className="relative p-4 md:p-8 lg:p-16 xl:p-20">
          <div className="text-center space-y-8 md:space-y-12 art-deco-reveal">
            <div className="flex justify-center mb-8 md:mb-12">
              <div className="relative parallax-float">
                <img 
                  src="/images/IMG_0085_(1).svg" 
                  alt="Nebula Noir" 
                  className="h-32 w-32 sm:h-40 sm:w-40 md:h-56 md:w-56 lg:h-72 lg:w-72 xl:h-80 xl:w-80"
                  style={{ 
                    filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 80px rgba(102, 51, 153, 0.5))'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent blur-3xl" />
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-[0.15em] md:tracking-[0.25em] leading-tight bioshock-glow-animated px-2">
                NEBULA NOIR
              </h1>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <div className="w-16 md:w-24 h-0.5 bg-gradient-to-r from-transparent via-foreground to-foreground bioshock-glow-animated" />
                <span className="text-base md:text-lg uppercase tracking-[0.3em] text-foreground/80 spark-theme-moon-symbol">☾</span>
                <div className="w-16 md:w-24 h-0.5 bg-gradient-to-l from-transparent via-foreground to-foreground bioshock-glow-animated" />
              </div>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light tracking-[0.15em] md:tracking-[0.2em] text-foreground/90 art-deco-reveal uppercase px-4" style={{ animationDelay: '0.1s' }}>
              {t('hero.tagline')}
            </p>

            <div className="max-w-3xl mx-auto art-deco-reveal-center px-4" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/75 leading-relaxed font-light tracking-wide">
                {t('hero.body')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-8 md:pt-12 art-deco-reveal-center px-4" style={{ animationDelay: '0.4s' }}>
              <a 
                href="#catalog" 
                className="group relative px-6 md:px-10 py-4 md:py-5 bg-transparent border-2 border-foreground text-foreground font-semibold uppercase tracking-[0.15em] md:tracking-[0.25em] transition-all duration-500 overflow-hidden metallic-border hover:text-background text-sm md:text-base art-deco-button-hover"
              >
                <span className="relative z-10">{t('hero.ctaCollection')}</span>
                <div className="absolute inset-0 bg-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </a>
              <a 
                href="#about" 
                className="group relative px-6 md:px-10 py-4 md:py-5 bg-transparent border-2 border-primary/50 text-foreground font-semibold uppercase tracking-[0.15em] md:tracking-[0.25em] transition-all duration-500 overflow-hidden hover:border-primary text-sm md:text-base art-deco-button-hover glow-pulse-subtle"
                style={{ boxShadow: '0 0 20px rgba(102, 51, 153, 0.2)' }}
              >
                <span className="relative z-10 group-hover:text-primary transition-colors">{t('hero.ctaPhilosophy')}</span>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
