import Link from 'next/link'
import { isDemoMode } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { InquiriesManager } from '@/components/admin/InquiriesManager'
import { getAdminT } from '@/i18n/server'

const PAGE_SIZE = 100

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const t = await getAdminT()
  const demo = isDemoMode()
  const rawPage = Number((await searchParams).page)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0
  let rows: { id: string; name: string; email: string; message: string; read: boolean; created_at: string }[] = []
  let total = 0
  if (!demo) {
    const supabase = await createServerSupabase()
    if (supabase) {
      const from = page * PAGE_SIZE
      const [{ data }, countResult] = await Promise.all([
        supabase
          .from('contact_inquiries')
          .select('id, name, email, message, read, created_at')
          .order('created_at', { ascending: false })
          .range(from, from + PAGE_SIZE - 1),
        supabase.from('contact_inquiries').select('id', { count: 'exact', head: true }),
      ])
      rows = (data as typeof rows) || []
      total = countResult.error ? -1 : (countResult.count ?? 0)
    }
  }
  const hasNewer = page > 0
  const hasOlder = total < 0 ? rows.length === PAGE_SIZE : total > (page + 1) * PAGE_SIZE
  const linkClass =
    'inline-block border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background'

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.inquiries')}</h2>
      {demo ? (
        <p className="text-foreground/70 font-light">{t('admin.inquiriesDemoEmpty')}</p>
      ) : (
        <>
          <InquiriesManager rows={rows} />
          {hasNewer || hasOlder ? (
            <div className="flex gap-3">
              {hasNewer ? (
                <Link href={page === 1 ? '/admin/inquiries' : `/admin/inquiries?page=${page - 1}`} className={linkClass}>
                  {t('admin.inquiriesNewer')}
                </Link>
              ) : null}
              {hasOlder ? (
                <Link href={`/admin/inquiries?page=${page + 1}`} className={linkClass}>
                  {t('admin.inquiriesOlder')}
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
