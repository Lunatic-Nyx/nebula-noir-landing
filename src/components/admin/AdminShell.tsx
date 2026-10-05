'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AdminNav } from '@/components/admin/AdminNav'
import { createBrowserSupabase } from '@/lib/supabase/client'
import { TOAST_STYLE } from '@/lib/design'
import { useT } from '@/i18n/context'

export function AdminShell({ children, demo }: { children: React.ReactNode; demo?: boolean }) {
  const router = useRouter()
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = async () => {
    const supabase = createBrowserSupabase()
    await supabase?.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const footerActions = (
    <div className="space-y-2 border-t border-foreground/20 pt-6">
      <Link
        href="/"
        className="flex min-h-[44px] items-center rounded-sm px-3 py-2 text-sm uppercase tracking-[0.15em] text-foreground/80 transition-all duration-300 hover:bg-foreground/10 hover:text-foreground"
      >
        {t('admin.site')}
      </Link>
      {!demo ? (
        <button
          type="button"
          onClick={logout}
          className="flex min-h-[44px] w-full items-center rounded-sm px-3 py-2 text-left text-sm uppercase tracking-[0.15em] text-foreground/80 transition-all duration-300 hover:bg-foreground/10 hover:text-foreground"
        >
          {t('admin.logout')}
        </button>
      ) : null}
    </div>
  )

  const demoBanner = demo ? (
    <div className="mb-8 border border-foreground/20 bg-primary/10 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-foreground/80">
        {t('admin.demoBanner')}
      </p>
    </div>
  ) : null

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden max-w-full relative">
      <div className="crt-scanline" />
      <div className="relative z-[20]">
        <header className="lg:hidden sticky top-0 z-50 border-b-2 border-foreground/20 bg-background/98 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
            <Link href="/admin" className="text-lg uppercase tracking-[0.2em] bioshock-glow-animated">
              {t('admin.title')}
            </Link>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Menü"
                  className="min-h-[44px] min-w-[44px] border-2 border-foreground/30 px-3 text-xs uppercase tracking-[0.15em] transition-all duration-300 hover:bg-foreground hover:text-background"
                >
                  Menü
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto border-r-2 border-foreground/30 bg-card p-6">
                <SheetTitle className="text-lg uppercase tracking-[0.2em] bioshock-glow-animated">
                  {t('admin.title')}
                </SheetTitle>
                <SheetDescription className="sr-only">Admin-Navigation</SheetDescription>
                <div className="mt-6">
                  <AdminNav onNavigate={() => setMenuOpen(false)} />
                </div>
                {footerActions}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-8">
              <Link href="/admin" className="block text-xl uppercase tracking-[0.2em] bioshock-glow-animated">
                {t('admin.title')}
              </Link>
              <AdminNav />
              {footerActions}
            </div>
          </aside>
          <main className="min-w-0">
            {demoBanner}
            {children}
          </main>
        </div>

        <Toaster position="top-center" toastOptions={{ style: TOAST_STYLE }} />
      </div>
    </div>
  )
}
