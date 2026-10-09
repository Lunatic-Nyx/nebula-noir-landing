'use server'

import { createHash } from 'node:crypto'
import { after } from 'next/server'
import { headers } from 'next/headers'
import { isDemoMode } from '@/lib/env'
import { getServerT } from '@/i18n/server'
import { contactWriteAllowed, type LimitResult } from '@/lib/contact-limit'
import { createServiceSupabase } from '@/lib/supabase/service'
import { sendContactNotification } from '@/lib/email'

const CONTACT_LIMIT = 5
const CONTACT_WINDOW_SECONDS = 600

function limitKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

async function consumeLimit(
  service: NonNullable<ReturnType<typeof createServiceSupabase>>,
  key: string,
): Promise<LimitResult> {
  const { data, error } = await service.rpc('consume_rate_limit', {
    p_key: key,
    p_limit: CONTACT_LIMIT,
    p_window_seconds: CONTACT_WINDOW_SECONDS,
  })
  if (error) {
    console.warn('[contact] rate limit check failed:', error.message)
    return 'down'
  }
  return data === false ? 'limited' : 'ok'
}

// Fail closed: the insert uses the service role, so a missing limiter must not
// open the form. One IP cap stops email rotation; a second per-email cap at the
// same number would never allow more.
async function checkRateLimit(): Promise<LimitResult> {
  const service = createServiceSupabase()
  if (!service) return 'down'
  try {
    const headerList = await headers()
    const forwarded = headerList.get('x-forwarded-for')?.split(',')[0]?.trim()
    const ip = forwarded || headerList.get('x-real-ip')?.trim() || 'unknown'
    return await consumeLimit(service, `contact-ip:${limitKey(ip)}`)
  } catch (error) {
    console.warn('[contact] rate limit check threw:', error instanceof Error ? error.message : error)
    return 'down'
  }
}

type ContactResult = { ok: true; demo?: boolean } | { ok: false; error: string; demo?: boolean }

export async function submitContact(formData: {
  name: string
  email: string
  message: string
}): Promise<ContactResult> {
  const t = await getServerT()
  const name = formData.name.trim()
  const email = formData.email.trim()
  const message = formData.message.trim()

  if (!name || !email || !message) {
    return { ok: false, error: t('contact.fillAll') }
  }
  if (!email.includes('@')) {
    return { ok: false, error: t('contact.invalidEmail') }
  }
  if (name.length > 200 || email.length > 320 || message.length > 5000) {
    return { ok: false, error: t('contact.tooLong') }
  }

  if (isDemoMode()) {
    return { ok: true, demo: true }
  }

  const limited = await checkRateLimit()
  if (!contactWriteAllowed(limited)) {
    return { ok: false, error: limited === 'limited' ? t('contact.rateLimited') : t('contact.unavailable') }
  }

  const service = createServiceSupabase()
  if (!service) {
    return { ok: false, error: t('contact.unavailable') }
  }

  const { error } = await service.from('contact_inquiries').insert({ name, email, message })
  if (error) {
    return { ok: false, error: t('contact.saveFailed') }
  }

  // Best effort and after the response: the inquiry is already stored, and a
  // mail failure must neither delay nor fail the form.
  after(async () => {
    const notification = await sendContactNotification({ name, email, message })
    if (!notification.ok) {
      console.warn('[contact] notification email not sent:', notification.error)
    }
  })

  return { ok: true }
}
