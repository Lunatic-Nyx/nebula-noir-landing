'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function HealthRefresh() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="min-h-[44px] border-2 border-foreground bg-transparent px-4 text-xs uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
    >
      {pending ? 'Prüft…' : 'Aktualisieren'}
    </button>
  )
}
