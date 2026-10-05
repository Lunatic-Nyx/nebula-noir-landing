import Link from 'next/link'
import { getCategories, getEvents, getGallery, getInstagramPosts } from '@/lib/data'
import { isDemoMode, isR2Configured } from '@/lib/env'
import { createServerSupabase } from '@/lib/supabase/server'
import { getApiSecretStatus } from '@/lib/secrets/store'
import { isEncryptionConfigured } from '@/lib/secrets/crypto'
import type { SecretSource } from '@/lib/secrets/store'

function sourceLabel(source: SecretSource): string {
  return source === 'db' ? 'gespeichert' : source === 'env' ? 'ENV' : 'fehlt'
}

export default async function AdminHome() {
  const demo = isDemoMode()
  const [gallery, events, categories, instagram, secrets] = await Promise.all([
    getGallery(),
    getEvents(),
    getCategories(),
    getInstagramPosts(),
    getApiSecretStatus(),
  ])

  let inquiries: number | null = null
  if (!demo) {
    const supabase = await createServerSupabase()
    if (supabase) {
      const { count } = await supabase
        .from('contact_inquiries')
        .select('id', { count: 'exact', head: true })
      inquiries = count ?? 0
    }
  }

  const counts = [
    { label: 'Galerie-Bilder', value: String(gallery.length), href: '/admin/gallery' },
    { label: 'Events', value: String(events.length), href: '/admin/events' },
    { label: 'Kategorien', value: String(categories.length), href: '/admin/categories' },
    { label: 'Instagram-Posts', value: String(instagram.length), href: '/admin/instagram' },
    { label: 'Anfragen', value: inquiries === null ? '—' : String(inquiries), href: '/admin/inquiries' },
  ]

  const status = [
    { label: 'Demo Mode', value: demo ? 'an' : 'aus' },
    { label: 'R2', value: isR2Configured() ? 'konfiguriert' : 'fehlt' },
    { label: 'Resend', value: sourceLabel(secrets.resend_api_key) },
    { label: 'Instagram-Token', value: sourceLabel(secrets.instagram_access_token) },
    { label: 'Secret-Verschlüsselung', value: isEncryptionConfigured() ? 'aktiv' : 'fehlt' },
  ]

  return (
    <div className="space-y-12">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="border-2 border-foreground/30 bg-background/50 p-5 transition-all duration-300 hover:border-foreground"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">{item.label}</p>
            <p className="mt-2 text-3xl font-light bioshock-glow">{item.value}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl uppercase tracking-[0.2em] bioshock-glow-animated">Status</h3>
        <ul className="space-y-2 text-sm">
          {status.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4 border-b border-foreground/10 py-2">
              <span className="uppercase tracking-wider text-foreground/70">{item.label}</span>
              <span className="uppercase tracking-wider">{item.value}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/health"
          className="inline-block border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
        >
          Detaillierte API-Prüfung
        </Link>
      </div>
    </div>
  )
}
