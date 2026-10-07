'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-gate'
import { isApiSecretKey } from '@/lib/secrets/catalog'
import { clearApiSecret, setApiSecret } from '@/lib/secrets/store'

type SecretActionResult = { ok: true } | { ok: false; error: string }

export async function saveSecret(key: string, value: string): Promise<SecretActionResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  if (!isApiSecretKey(key)) return { ok: false, error: 'Unbekannter Schlüssel' }
  const result = await setApiSecret(key, value)
  if (result.ok) {
    revalidatePath('/admin/secrets')
    revalidatePath('/admin/health')
  }
  return result
}

export async function clearSecret(key: string): Promise<SecretActionResult> {
  const gate = await requireAdmin()
  if (gate.error) return { ok: false, error: gate.error }
  if (gate.demo) return { ok: false, error: gate.t('admin.demoWriteDisabled') }
  if (!isApiSecretKey(key)) return { ok: false, error: 'Unbekannter Schlüssel' }
  const result = await clearApiSecret(key)
  if (result.ok) {
    revalidatePath('/admin/secrets')
    revalidatePath('/admin/health')
  }
  return result
}
