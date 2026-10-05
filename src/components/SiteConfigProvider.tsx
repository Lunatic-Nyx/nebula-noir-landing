'use client'

import { createContext, useContext } from 'react'
import type { FooterConfig, PublicSiteConfig } from '@/lib/site-config.types'

interface SiteConfigValue {
  site: PublicSiteConfig
  footer: FooterConfig
}

const SiteConfigContext = createContext<SiteConfigValue | null>(null)

export function SiteConfigProvider({
  site,
  footer,
  children,
}: {
  site: PublicSiteConfig
  footer: FooterConfig
  children: React.ReactNode
}) {
  return <SiteConfigContext.Provider value={{ site, footer }}>{children}</SiteConfigContext.Provider>
}

function useSiteConfigValue(): SiteConfigValue {
  const ctx = useContext(SiteConfigContext)
  if (!ctx) throw new Error('useSiteConfig outside SiteConfigProvider')
  return ctx
}

export function useSiteConfig(): PublicSiteConfig {
  return useSiteConfigValue().site
}

export function useFooterConfig(): FooterConfig {
  return useSiteConfigValue().footer
}
