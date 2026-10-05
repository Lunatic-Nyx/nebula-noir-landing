export interface ApiSecretMeta {
  envVar: string
  label: string
  sensitive: boolean
}

// Isomorphic catalog: safe for client imports (labels + env names only).
export const API_SECRET_KEYS = {
  resend_api_key: { envVar: 'RESEND', label: 'Resend API-Key', sensitive: true },
  contact_from_email: { envVar: 'CONTACT_FROM_EMAIL', label: 'Absender-E-Mail', sensitive: false },
  contact_to_email: { envVar: 'CONTACT_TO_EMAIL', label: 'Empfänger-E-Mail', sensitive: false },
  instagram_access_token: { envVar: 'INSTAGRAM_ACCESS_TOKEN', label: 'Instagram Access Token', sensitive: true },
  instagram_user_id: { envVar: 'INSTAGRAM_USER_ID', label: 'Instagram User-ID', sensitive: false },
} as const

export type ApiSecretKey = keyof typeof API_SECRET_KEYS

export const API_SECRET_KEYS_LIST = Object.keys(API_SECRET_KEYS) as ApiSecretKey[]

export function isApiSecretKey(value: string): value is ApiSecretKey {
  return Object.prototype.hasOwnProperty.call(API_SECRET_KEYS, value)
}
