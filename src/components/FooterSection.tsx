'use client'

import { useI18n } from '@/i18n/context'
import { useFooterConfig } from '@/components/SiteConfigProvider'
import { footerText } from '@/lib/footer-config'

const linkClass =
  'text-foreground/70 hover:text-foreground transition-all duration-300 uppercase text-xs tracking-wider text-left'

export function FooterSection() {
  const { locale } = useI18n()
  const footer = useFooterConfig()
  const currentYear = new Date().getFullYear()

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
              {footerText(footer.blurb, locale)}
            </p>
          </div>

          {footer.columns.map((column, columnIndex) => (
            <div key={`${columnIndex}-${column.title.de}`}>
              <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.25em] mb-4 md:mb-6 bioshock-glow-animated">
                {footerText(column.title, locale)}
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={`${linkIndex}-${link.href}`}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className={linkClass}
                    >
                      {footerText(link.label, locale)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-foreground/20 pt-6 md:pt-8">
          <div className="text-center space-y-2 md:space-y-3">
            <p className="break-words text-xs uppercase leading-relaxed tracking-[0.12em] text-foreground/60 sm:tracking-[0.15em]">
              {footerText(footer.copyright, locale).replaceAll('{year}', String(currentYear))}
            </p>
            <p className="text-foreground/50 text-xs tracking-wider">
              {footerText(footer.madeIn, locale)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
