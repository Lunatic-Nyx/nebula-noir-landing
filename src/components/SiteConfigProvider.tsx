'use client'

import { createContext, useContext } from 'react'
import type { PublicSiteConfig } from '@/lib/site-config.types'

const SiteConfigContext = createContext<PublicSiteConfig | null>(null)

export function SiteConfigProvider({
  value,
  children,
}: {
  value: PublicSiteConfig
  children: React.ReactNode
}) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig(): PublicSiteConfig {
  const ctx = useContext(SiteConfigContext)
  if (!ctx) throw new Error('useSiteConfig outside SiteConfigProvider')
  return ctx
}
