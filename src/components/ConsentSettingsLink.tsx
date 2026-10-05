'use client'

import { useT } from '@/i18n/context'
import { CONSENT_COOKIE } from '@/lib/consent'

export function ConsentSettingsLink() {
  const t = useT()
  return (
    <button
      type="button"
      onClick={() => {
        const secure = window.location.protocol === 'https:' ? ';secure' : ''
        document.cookie = `${CONSENT_COOKIE}=;path=/;max-age=0${secure}`
        window.location.reload()
      }}
      className="text-xs tracking-wider text-foreground/50 underline transition-colors hover:text-foreground"
    >
      {t('consent.settings')}
    </button>
  )
}
