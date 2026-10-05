'use client'

import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/Navigation'
import { HeroSection } from '@/components/HeroSection'
import { SectionTransition } from '@/components/SectionTransition'
import { AboutSection } from '@/components/AboutSection'
import { CatalogSection } from '@/components/CatalogSection'
import { ContactSection } from '@/components/ContactSection'
import { FooterSection } from '@/components/FooterSection'
import { ArtDecoFrameAnimation } from '@/components/ArtDecoFrameAnimation'
import { ArtDecoBackground } from '@/components/ArtDecoBackground'
import { EventsSection } from '@/components/EventsSection'
import { InstagramSection } from '@/components/InstagramSection'
import LoadingScreen from '@/themes/nebula-noir-theme/LoadingScreen'
import { TOAST_STYLE } from '@/lib/design'
import type { BrandInfo, EventItem, InstagramPost, Product } from '@/lib/types'

interface HomePageProps {
  products: Product[]
  brandInfo: Record<string, BrandInfo>
  events: EventItem[]
  instagram: InstagramPost[]
  heroVideoUrl?: string
}

export function HomePage({ products, brandInfo, events, instagram, heroVideoUrl }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('nn-intro-lock', isLoading)
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    if (isLoading) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    }
    return () => {
      html.classList.remove('nn-intro-lock')
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [isLoading])

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} duration={3500} />
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden max-w-full relative">
      <div className="crt-scanline" />
      <ArtDecoBackground />
      <ArtDecoFrameAnimation />
      
      <div className="relative z-[20]">
        <Navigation showEvents={events.length > 0} showInstagram={instagram.length > 0} />
        
        <HeroSection videoUrl={heroVideoUrl} />
        <SectionTransition />
        <AboutSection info={brandInfo} />
        {events.length > 0 ? (
          <>
            <SectionTransition />
            <EventsSection events={events} />
          </>
        ) : null}
        <SectionTransition />
        <CatalogSection products={products} />
        {instagram.length > 0 ? (
          <>
            <SectionTransition />
            <InstagramSection posts={instagram} />
          </>
        ) : null}
        <SectionTransition />
        <ContactSection />
        <FooterSection />

        <Toaster 
          position="top-center"
          toastOptions={{ style: TOAST_STYLE }}
        />
      </div>
    </div>
  )
}
