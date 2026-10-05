import { isResendConfigured } from '@/lib/env'

// Server-only module. Do NOT add a 'use server' directive: that would expose
// every exported async function as a public RPC endpoint.
const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Nebula Noir <contact@nebula-noir.com>'
const DEFAULT_TO = 'contact@nebula-noir.com'
const SEND_TIMEOUT_MS = 8000

type SendEmailInput = {
  to: string
  subject: string
  text: string
  replyTo?: string
  from?: string
}

export type SendEmailResult = { ok: true } | { ok: false; error: string }

async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND
  if (!apiKey) return { ok: false, error: 'RESEND is not configured' }

  const replyTo =
    input.replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.replyTo) ? input.replyTo : undefined

  const payload: Record<string, unknown> = {
    from: input.from || process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
    to: [input.to],
    subject: input.subject.replace(/\s+/g, ' ').slice(0, 200),
    text: input.text,
  }
  if (replyTo) payload.reply_to = replyTo

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
 */
export async function sendContactNotification(input: {
  name: string
  email: string
  message: string
}): Promise<SendEmailResult> {
  if (!isResendConfigured()) return { ok: false, error: 'RESEND is not configured' }

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
    to: process.env.CONTACT_TO_EMAIL || DEFAULT_TO,
    subject: `Neue Anfrage über nebula-noir.com – ${input.name}`,
    text,
    replyTo: input.email,
  })
}
