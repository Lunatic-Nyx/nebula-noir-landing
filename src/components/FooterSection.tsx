'use client'

import { LegalSection } from '@/lib/legal-content'
import { useT } from '@/i18n/context'
import { useSiteConfig } from '@/components/SiteConfigProvider'

const legalLinkClass =
  'text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider text-left'

export function FooterSection() {
  const t = useT()
  const siteConfig = useSiteConfig()
  const currentYear = new Date().getFullYear()

  const legalHref = (section: LegalSection) => {
    switch (section) {
      case 'impressum':
        return '/impressum'
      case 'datenschutz':
        return '/datenschutz'
      case 'agb':
        return '/agb'
      case 'widerruf':
        return '/widerruf'
      case 'versand':
        return '/versand'
      case 'customOrders':
        return '/custom-orders'
      case 'about':
        return '/ueber-uns'
    }
  }

  return (
    <footer className="border-t-2 border-foreground/20 py-12 md:py-16 overflow-hidden max-w-full">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src="/images/IMG_0085_(1).svg" 
                alt="Nebula Noir" 
                className="h-10 w-10 md:h-12 md:w-12"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}
              />
              <h3 className="text-lg md:text-2xl uppercase tracking-[0.15em] md:tracking-[0.2em] bioshock-glow-animated">Nebula Noir</h3>
            </div>
            <p className="text-foreground/70 leading-relaxed font-light text-xs md:text-sm">
              {t('footer.blurb')}
            </p>
          </div>

          <div>
            <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] mb-4 md:mb-6 bioshock-glow-animated">{t('footer.shop')}</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a href="/#catalog" className="text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider">
                  {t('footer.collection')}
                </a>
              </li>
              <li>
                <a href="/#about" className="text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider">
                  {t('footer.philosophy')}
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider">
                  {t('footer.custom')}
                </a>
              </li>
              <li>
                <a 
                  href={legalHref('customOrders')}
                  className={legalLinkClass}
                >
                  {t('footer.customOrders')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] mb-4 md:mb-6 bioshock-glow-animated">{t('footer.info')}</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a 
                  href={legalHref('about')}
                  className={legalLinkClass}
                >
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a 
                  href={legalHref('versand')}
                  className={legalLinkClass}
                >
                  {t('footer.shipping')}
                </a>
              </li>
              <li>
                <a 
                  href={siteConfig.etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider"
                >
                  {t('footer.etsy')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] mb-4 md:mb-6 bioshock-glow-animated">{t('footer.legal')}</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a 
                  href={legalHref('impressum')}
                  className={legalLinkClass}
                >
                  {t('footer.impressum')}
                </a>
              </li>
              <li>
                <a 
                  href={legalHref('datenschutz')}
                  className={legalLinkClass}
                >
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a 
                  href={legalHref('agb')}
                  className={legalLinkClass}
                >
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a 
                  href={legalHref('widerruf')}
                  className={legalLinkClass}
                >
                  {t('footer.withdrawal')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-foreground/20 pt-6 md:pt-8">
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-foreground/60 text-xs uppercase tracking-[0.15em]">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <p className="text-foreground/50 text-xs tracking-wider">
              {t('footer.madeIn')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
