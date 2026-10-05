import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerT } from '@/i18n/server'
import { getTranslationOverrides } from '@/i18n/overrides'
import { LocaleProvider } from '@/i18n/context'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminUser()
  // Admin is a German-only operator surface (product decision), independent of
  // the public locale cookie.
  const overrides = await getTranslationOverrides()

  if (session.demo) {
    return (
      <LocaleProvider initialLocale="de" overrides={overrides}>
        <AdminShell demo>{children}</AdminShell>
      </LocaleProvider>
    )
  }
  if (!session.user) {
    redirect('/login')
  }
  if (!session.isAdmin) {
    const t = await getServerT()
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <p className="uppercase tracking-[0.2em]">{t('admin.forbidden')}</p>
      </div>
    )
  }
  return (
    <LocaleProvider initialLocale="de" overrides={overrides}>
      <AdminShell>{children}</AdminShell>
    </LocaleProvider>
  )
}
