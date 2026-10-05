'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { InstagramLogo, List } from '@phosphor-icons/react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useSiteConfig } from '@/components/SiteConfigProvider'
import { useT } from '@/i18n/context'

interface NavigationProps {
  homeHref?: string
  showEvents?: boolean
  showInstagram?: boolean
}

export function Navigation({ homeHref = '/', showEvents = true, showInstagram = true }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const t = useT()
  const siteConfig = useSiteConfig()
  const navLinks = [
    { href: '/#catalog', label: t('nav.collection') },
    { href: '/#about', label: t('nav.philosophy') },
    ...(showEvents ? [{ href: '/#events', label: t('nav.events') }] : []),
    ...(showInstagram ? [{ href: '/#instagram', label: t('nav.instagram') }] : []),
    { href: '/#contact', label: t('nav.customOrders') }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-background/98 backdrop-blur-md border-b-2 border-foreground/20 shadow-[0_0_30px_rgba(0,0,0,0.8)]' : 'bg-transparent'
    }`}>
      <div className="container max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <a href={homeHref} className="flex items-center gap-2 md:gap-4 group relative">
            <div className="relative">
              <img 
                src="/images/IMG_0085_(1).svg" 
                alt="Nebula Noir" 
                className="h-14 w-14 md:h-20 md:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 transition-all duration-500 group-hover:scale-105"
                style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 25px rgba(102, 51, 153, 0.3))' }}
              />
            </div>
            <span className="text-base md:text-xl lg:text-2xl xl:text-3xl font-bold uppercase tracking-[0.15em] md:tracking-[0.25em] hidden sm:inline spark-theme-bioshock-glow-animated">
              Nebula Noir
            </span>
          </a>

          <div className="hidden xl:flex items-center gap-5 xl:gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-[0.2em] text-foreground/90 hover:text-foreground transition-all duration-300 relative group/link"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover/link:w-full transition-all duration-300 shadow-[0_0_8px_rgba(102,51,153,0.6)]" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="hidden sm:block shrink-0">
              <LanguageSwitcher />
            </div>
            <Button 
              asChild
              variant="outline" 
              size="icon"
              className="relative metallic-border hover:bg-foreground hover:text-background transition-all duration-500"
            >
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramLogo size={24} weight="bold" />
              </a>
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button variant="outline" size="icon" className="metallic-border" aria-label={t('nav.menu')}>
                  <List size={24} weight="bold" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card border-l-2 border-foreground/30">
                <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
                <SheetDescription className="sr-only">{t('nav.menu')}</SheetDescription>
                <div className="flex justify-center mb-8 mt-4">
                  <img 
                    src="/images/IMG_0085_(1).svg" 
                    alt="Nebula Noir" 
                    className="h-28 w-28"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 30px rgba(102, 51, 153, 0.4))' }}
                  />
                </div>
                <nav className="flex flex-col gap-6">
                  {navLinks.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-xl uppercase tracking-[0.15em] hover:text-foreground transition-all duration-300 text-foreground/90 bioshock-glow-animated"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="pt-4 lg:hidden">
                    <LanguageSwitcher />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
