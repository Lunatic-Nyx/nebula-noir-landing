'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { triggerInstagramSync } from '@/lib/actions/admin'
import { useT } from '@/i18n/context'

export default function AdminInstagramPage() {
  const t = useT()
  const [busy, setBusy] = useState(false)
  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">{t('admin.instagram')}</h2>
      <p className="text-foreground/70 font-light">{t('admin.instagramIntro')}</p>
      <ul className="space-y-2 text-sm text-foreground/70 font-light">
        <li>{t('admin.instagramScope')}</li>
        <li>{t('admin.instagramToken')}</li>
        <li>{t('admin.instagramUserId')}</li>
      </ul>
      <Button
        type="button"
        disabled={busy}
        className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] font-semibold px-8 py-4"
        onClick={async () => {
          setBusy(true)
          const result = await triggerInstagramSync()
          setBusy(false)
          if (!result.ok) toast.error(result.error)
          else toast.success(t('admin.syncResult', { count: result.count ?? 0 }))
        }}
      >
        {busy ? t('admin.syncing') : t('admin.syncNow')}
      </Button>
    </div>
  )
}
