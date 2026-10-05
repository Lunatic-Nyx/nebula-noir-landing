import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { isDemoMode, isR2Configured } from '@/lib/env'
import { getR2Client } from '@/lib/r2'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceSupabase } from '@/lib/supabase/service'
import { getApiSecretStatus, loadSecrets } from '@/lib/secrets/store'
import { isEncryptionConfigured } from '@/lib/secrets/crypto'
import { API_SECRET_KEYS_LIST } from '@/lib/secrets/catalog'

// Server-only health checks. Never include secrets in `detail`.
export type CheckStatus = 'ok' | 'degraded' | 'error' | 'not_configured' | 'demo'

export interface HealthCheck {
  id: string
  label: string
  status: CheckStatus
  latencyMs: number
  detail?: string
}

async function runCheck(
  id: string,
  label: string,
  fn: () => Promise<{ status: CheckStatus; detail?: string }>,
  timeoutMs = 6000
): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const result = await withTimeout(fn(), timeoutMs)
    return { id, label, latencyMs: Date.now() - start, ...result }
  } catch (error) {
    return {
      id,
      label,
      status: 'error',
      latencyMs: Date.now() - start,
      detail: safeDetail(error instanceof Error ? error.message : 'Fehler'),
    }
  }
}

function safeDetail(value: string): string {
  return value.replace(/\s+/g, ' ').slice(0, 200)
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout nach ${ms} ms`)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function checkSupabase() {
  if (isDemoMode()) return { status: 'demo' as const, detail: 'Demo Mode (keine Supabase-Keys)' }
  const supabase = await createServerSupabase()
  if (!supabase) return { status: 'demo' as const, detail: 'kein Supabase-Client' }
  const { count, error } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
  if (error) return { status: 'error' as const, detail: error.message }
  return { status: 'ok' as const, detail: `${count ?? 0} Kategorien` }
}

async function checkR2() {
  if (!isR2Configured()) return { status: 'not_configured' as const, detail: 'R2-Env unvollständig' }
  const client = getR2Client()
  if (!client) return { status: 'not_configured' as const, detail: 'kein R2-Client' }
  await client.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, MaxKeys: 1 }))
  return { status: 'ok' as const, detail: `Bucket ${process.env.R2_BUCKET_NAME}` }
}

async function checkResend() {
  const { values } = await loadSecrets()
  if (!values.resend_api_key) return { status: 'not_configured' as const, detail: 'kein API-Key' }
  const res = await fetch('https://api.resend.com/domains?limit=1', {
    headers: { Authorization: `Bearer ${values.resend_api_key}` },
    signal: AbortSignal.timeout(4000),
  })
  if (res.ok) return { status: 'ok' as const, detail: 'API erreichbar' }
  if (res.status === 401 || res.status === 403) {
    return { status: 'error' as const, detail: 'API-Key ungültig' }
  }
  return { status: 'error' as const, detail: `HTTP ${res.status}` }
}

async function checkInstagram() {
  const { values } = await loadSecrets()
  let token = values.instagram_access_token
  if (!token) {
    // Mirror the sync priority: legacy refreshed row counts as configured.
    try {
      const service = createServiceSupabase()
      if (service) {
        const { data } = await service
          .from('instagram_auth')
          .select('access_token')
          .eq('id', true)
          .maybeSingle()
        token = (data?.access_token as string | undefined) || undefined
      }
    } catch {
      // metadata lookup is best effort
    }
  }
  if (!token) return { status: 'not_configured' as const, detail: 'kein Token' }

  const version = process.env.INSTAGRAM_GRAPH_VERSION || 'v22.0'
  const res = await fetch(
    `https://graph.instagram.com/${version}/me?fields=user_id,username&access_token=${encodeURIComponent(token)}`,
    { signal: AbortSignal.timeout(5000), cache: 'no-store' }
  )
  if (!res.ok) return { status: 'error' as const, detail: `Graph API HTTP ${res.status}` }

  // Optional: warn when the rotated token is about to expire.
  try {
    const service = createServiceSupabase()
    if (service) {
      const { data } = await service
        .from('instagram_auth')
        .select('expires_at')
        .eq('id', true)
        .maybeSingle()
      const expiresAt = data?.expires_at as string | undefined
      if (expiresAt) {
        const days = (Date.parse(expiresAt) - Date.now()) / 86_400_000
        if (Number.isFinite(days) && days < 7) {
          return { status: 'degraded' as const, detail: `Token läuft in ${Math.max(0, Math.floor(days))} Tagen ab` }
        }
      }
    }
  } catch {
    // expires_at is best effort
  }
  return { status: 'ok' as const, detail: 'Graph API erreichbar' }
}

async function checkConfig() {
  const status = await getApiSecretStatus()
  const configured = API_SECRET_KEYS_LIST.filter((key) => status[key] !== 'missing').length
  const encryption = isEncryptionConfigured()
  const detail = `Verschlüsselung: ${encryption ? 'aktiv' : 'fehlt'}; Secrets: ${configured}/${API_SECRET_KEYS_LIST.length}`
  return { status: encryption ? ('ok' as const) : ('degraded' as const), detail }
}

export async function runHealthChecks(): Promise<HealthCheck[]> {
  return Promise.all([
    runCheck('supabase', 'Supabase (Datenbank)', checkSupabase),
    runCheck('r2', 'Cloudflare R2', checkR2),
    runCheck('resend', 'Resend (E-Mail)', checkResend),
    runCheck('instagram', 'Instagram Graph API', checkInstagram),
    runCheck('config', 'Konfiguration & Secrets', checkConfig),
  ])
}
