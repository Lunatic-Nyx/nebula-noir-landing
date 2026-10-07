import 'server-only'
import { loadSecrets } from '@/lib/secrets/store'
import { getPublicSiteConfig } from '@/lib/site-config'

// Server-only module. Do NOT add a 'use server' directive: that would expose
// every exported async function as a public RPC endpoint.
const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Nebula Noir <contact@nebula-noir.com>'
const DEFAULT_TO = 'contact@nebula-noir.com'
const SEND_TIMEOUT_MS = 8000

type SendEmailInput = {
  apiKey: string
  to: string
  subject: string
  text: string
  replyTo?: string
  from?: string
}

type SendEmailResult = { ok: true } | { ok: false; error: string }

async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const replyTo =
    input.replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.replyTo) ? input.replyTo : undefined

  const payload: Record<string, unknown> = {
    from: input.from || DEFAULT_FROM,
    to: [input.to],
    subject: input.subject.replace(/\s+/g, ' ').slice(0, 200),
    text: input.text,
  }
  if (replyTo) payload.reply_to = replyTo

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })
    if (!res.ok) {
      // Log the provider's own (generic) message, never the echoed request/PII.
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      const detail = body?.message ? body.message.replace(/\s+/g, ' ').slice(0, 160) : ''
      return { ok: false, error: `Resend ${res.status}${detail ? `: ${detail}` : ''}` }
    }
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'email send failed'
    return { ok: false, error: message }
  }
}

/**
 * Best-effort notification email for a new contact inquiry. Never throws.
 * Callers must treat a failure as non-fatal: the inquiry is already persisted.
 * The API key and addresses resolve from the encrypted store, then env fallback.
 */
export async function sendContactNotification(input: {
  name: string
  email: string
  message: string
}): Promise<SendEmailResult> {
  const [{ values }, site] = await Promise.all([loadSecrets(), getPublicSiteConfig()])
  const apiKey = values.resend_api_key
  if (!apiKey) return { ok: false, error: 'RESEND is not configured' }

  const text = [
    'Neue Kontaktanfrage über die Website nebula-noir.com.',
    '',
    `Name: ${input.name}`,
    `E-Mail: ${input.email}`,
    `Zeit: ${new Date().toISOString()}`,
    '',
    'Nachricht:',
    input.message,
  ].join('\n')

  return sendEmail({
    apiKey,
    from: values.contact_from_email || DEFAULT_FROM,
    to: values.contact_to_email || site.contactEmail || DEFAULT_TO,
    subject: `Neue Anfrage über nebula-noir.com – ${input.name}`,
    text,
    replyTo: input.email,
  })
}
