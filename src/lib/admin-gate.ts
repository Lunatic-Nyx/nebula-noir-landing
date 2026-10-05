import { getAdminUser } from '@/lib/auth'
import { getServerT } from '@/i18n/server'

export type ServerT = (path: string, vars?: Record<string, string | number>) => string

export interface AdminGate {
  demo: boolean
  error?: string
  t: ServerT
}

// Server-only helper. Do NOT add a 'use server' directive; this guards actions,
// it is not an action itself.
export async function requireAdmin(): Promise<AdminGate> {
  const t = await getServerT()
  const session = await getAdminUser()
  if (session.demo) return { demo: true, t }
  if (!session.isAdmin) return { demo: false, error: t('admin.notAuthorized'), t }
  return { demo: false, t }
}
