import { isDemoMode } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { InquiriesManager } from '@/components/admin/InquiriesManager'
import { getAdminT } from '@/i18n/server'

export default async function AdminInquiriesPage() {
  const t = await getAdminT()
  const demo = isDemoMode()
  let rows: { id: string; name: string; email: string; message: string; read: boolean; created_at: string }[] = []
  if (!demo) {
    const supabase = await createServerSupabase()
    if (supabase) {
      const { data } = await supabase
        .from('contact_inquiries')
        .select('id, name, email, message, read, created_at')
        .order('created_at', { ascending: false })
      rows = (data as typeof rows) || []
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.inquiries')}</h2>
      {demo ? (
        <p className="text-foreground/70 font-light">{t('admin.inquiriesDemoEmpty')}</p>
      ) : (
        <InquiriesManager rows={rows} />
      )}
    </div>
  )
}
