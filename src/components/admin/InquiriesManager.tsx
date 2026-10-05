'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { markInquiryRead, deleteInquiry } from '@/lib/actions/admin'
import { useI18n } from '@/i18n/context'

type Row = { id: string; name: string; email: string; message: string; read: boolean; created_at: string }

export function InquiriesManager({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const { locale, t } = useI18n()
  if (!rows.length) {
    return <p className="text-foreground/70 font-light">{t('admin.inquiriesEmpty')}</p>
  }
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <article key={row.id} className="border-2 border-foreground/30 p-6 space-y-3">
          <p className="uppercase tracking-wider">{row.name} · {row.email}</p>
          <p className="text-sm text-foreground/70 font-light whitespace-pre-wrap">{row.message}</p>
          <p className="text-xs text-foreground/50">{new Date(row.created_at).toLocaleString(locale === 'en' ? 'en-GB' : 'de-DE')}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] text-xs"
              onClick={async () => {
                const result = await markInquiryRead(row.id, !row.read)
                if (!result.ok) toast.error(result.error)
                else router.refresh()
              }}
            >
              {row.read ? t('admin.markUnread') : t('admin.markRead')}
            </Button>
            <Button
              type="button"
              className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] text-xs"
              onClick={async () => {
                const result = await deleteInquiry(row.id)
                if (!result.ok) toast.error(result.error)
                else router.refresh()
              }}
            >
              {t('admin.delete')}
            </Button>
          </div>
        </article>
      ))}
    </div>
  )
}
