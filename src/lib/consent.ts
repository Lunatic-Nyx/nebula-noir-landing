export const CONSENT_COOKIE = 'nn-consent'
export const CONSENT_VERSION = 1

export interface ConsentState {
  version: number
  necessary: true
  external: boolean
  ts: string
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null
    return {
      version: CONSENT_VERSION,
      necessary: true,
      external: parsed.external === true,
      ts: typeof parsed.ts === 'string' ? parsed.ts : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function serializeConsent(external: boolean): string {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    necessary: true,
    external,
    ts: new Date().toISOString(),
  }
  return encodeURIComponent(JSON.stringify(state))
}

export function consentCookieAttributes(maxAgeSeconds: number, secure = false): string {
  return `path=/;max-age=${maxAgeSeconds};samesite=lax${secure ? ';secure' : ''}`
}
