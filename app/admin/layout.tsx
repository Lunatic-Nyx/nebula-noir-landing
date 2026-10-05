import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerT } from '@/i18n/server'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminUser()
  if (session.demo) {
    return <AdminShell demo>{children}</AdminShell>
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
  return <AdminShell>{children}</AdminShell>
}
