import { createServiceSupabase } from '@/lib/supabase/service'
import { decryptSecret, encryptSecret, isEncryptionConfigured } from '@/lib/secrets/crypto'
import {
  API_SECRET_KEYS,
  API_SECRET_KEYS_LIST,
  isApiSecretKey,
  type ApiSecretKey,
} from '@/lib/secrets/catalog'

// Server-only store. Do NOT add a 'use server' directive.
export type SecretSource = 'db' | 'env' | 'missing'

export interface SecretsSnapshot {
  values: Partial<Record<ApiSecretKey, string>>
  sources: Record<ApiSecretKey, SecretSource>
}

const CACHE_TTL_MS = 60_000
let cache: { at: number; snapshot: SecretsSnapshot } | null = null

function emptySources(): Record<ApiSecretKey, SecretSource> {
  const sources = {} as Record<ApiSecretKey, SecretSource>
  for (const key of API_SECRET_KEYS_LIST) sources[key] = 'missing'
  return sources
}

export async function loadSecrets(): Promise<SecretsSnapshot> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.snapshot

  const values: Partial<Record<ApiSecretKey, string>> = {}
  const sources = emptySources()

  const supabase = createServiceSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase.from('api_secrets').select('key, value_encrypted')
      if (!error) {
        for (const row of data ?? []) {
          const key = row.key as string
          if (!isApiSecretKey(key)) continue
          const decrypted = decryptSecret(key, row.value_encrypted as string)
          if (decrypted) {
            values[key] = decrypted
            sources[key] = 'db'
          }
        }
      }
    } catch (error) {
      console.error('[secrets] failed to read store', error)
    }
  }

  for (const key of API_SECRET_KEYS_LIST) {
    if (sources[key] === 'db') continue
    const env = process.env[API_SECRET_KEYS[key].envVar]
    if (env) {
      values[key] = env
      sources[key] = 'env'
    }
  }

  const snapshot = { values, sources }
  cache = { at: Date.now(), snapshot }
  return snapshot
}

export async function getApiSecret(key: ApiSecretKey): Promise<string | undefined> {
  return (await loadSecrets()).values[key]
}

export async function getApiSecretStatus(): Promise<Record<ApiSecretKey, SecretSource>> {
  return (await loadSecrets()).sources
}

export function invalidateSecretsCache() {
  cache = null
}

export type SecretMutationResult = { ok: true } | { ok: false; error: string }

export async function setApiSecret(key: ApiSecretKey, plaintext: string): Promise<SecretMutationResult> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: 'SECRETS_ENCRYPTION_KEY fehlt oder ist ungültig (64 Hex-Zeichen)' }
  }
  const value = plaintext.trim()
  if (!value) return { ok: false, error: 'Wert ist leer' }
  if (value.length > 4096) return { ok: false, error: 'Wert ist zu lang (max. 4096 Zeichen)' }

  const encrypted = encryptSecret(key, value)
  if (!encrypted) return { ok: false, error: 'Verschlüsselung fehlgeschlagen' }

  const supabase = createServiceSupabase()
  if (!supabase) return { ok: false, error: 'Supabase Service Role ist nicht konfiguriert' }

  const { error } = await supabase
    .from('api_secrets')
    .upsert({ key, value_encrypted: encrypted, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { ok: false, error: error.message }
  invalidateSecretsCache()

  if (key === 'instagram_access_token') {
    // A rotated DB token must win over the old instagram_auth row.
    const { error: deleteError } = await supabase.from('instagram_auth').delete().eq('id', true)
    if (deleteError) {
      return { ok: false, error: `Token gespeichert, aber instagram_auth konnte nicht geleert werden: ${deleteError.message}` }
    }
  }
  return { ok: true }
}

export async function clearApiSecret(key: ApiSecretKey): Promise<SecretMutationResult> {
  const supabase = createServiceSupabase()
  if (!supabase) return { ok: false, error: 'Supabase Service Role ist nicht konfiguriert' }
  const { error } = await supabase.from('api_secrets').delete().eq('key', key)
  if (error) return { ok: false, error: error.message }
  if (key === 'instagram_access_token') {
    // Also drop the legacy plaintext refresh row so the fallback takes over.
    const { error: deleteError } = await supabase.from('instagram_auth').delete().eq('id', true)
    if (deleteError) return { ok: false, error: deleteError.message }
  }
  invalidateSecretsCache()
  return { ok: true }
}
