'use server'

import { after } from 'next/server'
import { isDemoMode } from '@/lib/env'
import { getServerT } from '@/i18n/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { sendContactNotification } from '@/lib/email'

export type ContactResult = { ok: true; demo?: boolean } | { ok: false; error: string; demo?: boolean }

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

  const supabase = await createServerSupabase()
  if (!supabase) {
    return { ok: false, error: t('contact.unavailable'), demo: true }
  }

  const { error } = await supabase.from('contact_inquiries').insert({ name, email, message })
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
