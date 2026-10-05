'use client'

import { createBrowserSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useT } from '@/i18n/context'
import { TOAST_STYLE } from '@/lib/design'

export function AdminShell({
  children,
  demo,
}: {
  children: React.ReactNode
  demo?: boolean
}) {
  const router = useRouter()
  const t = useT()
  const links = [
    { href: '/admin', label: t('admin.overview') },
    { href: '/admin/gallery', label: t('admin.gallery') },
    { href: '/admin/events', label: t('admin.events') },
    { href: '/admin/info', label: t('admin.info') },
    { href: '/admin/inquiries', label: t('admin.inquiries') },
    { href: '/admin/instagram', label: t('admin.instagram') },
    { href: '/admin/hero', label: t('admin.hero') },
  ]

  const logout = async () => {
    const supabase = createBrowserSupabase()
    await supabase?.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden max-w-full relative">
      <div className="crt-scanline" />
      <div className="relative z-[20]">
        <header className="border-b-2 border-foreground/20 py-6">
          <div className="container max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.title')}</h1>
            <nav className="flex flex-wrap gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm uppercase tracking-[0.2em] text-foreground/90 hover:text-foreground transition-all duration-300"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/"
                className="text-sm uppercase tracking-[0.2em] text-foreground/90 hover:text-foreground transition-all duration-300"
              >
                {t('admin.site')}
              </a>
              <LanguageSwitcher />
              {!demo ? (
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm uppercase tracking-[0.2em] text-foreground/90 hover:text-foreground transition-all duration-300"
                >
                  {t('admin.logout')}
                </button>
              ) : null}
            </nav>
          </div>
        </header>
        {demo ? (
          <div className="border-b border-foreground/20 bg-primary/10">
            <p className="container max-w-6xl mx-auto px-4 md:px-6 py-3 text-xs uppercase tracking-wider text-foreground/80">
              {t('admin.demoBanner')}
            </p>
          </div>
        ) : null}
        <main className="container max-w-6xl mx-auto px-4 md:px-6 py-12">{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{ style: TOAST_STYLE }}
        />
      </div>
    </div>
  )
}
