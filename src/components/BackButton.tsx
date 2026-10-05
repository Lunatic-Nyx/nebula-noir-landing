'use client'

import { useRouter } from 'next/navigation'
import { useT } from '@/i18n/context'

export function BackButton({ fallback = '/', label }: { fallback?: string; label?: string }) {
  const router = useRouter()
  const t = useT()

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallback)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="min-h-[44px] border-2 border-foreground/40 px-4 text-xs uppercase tracking-[0.15em] text-foreground/80 transition-all duration-300 hover:border-foreground hover:text-foreground"
    >
      ← {label ?? t('common.back')}
    </button>
  )
}
