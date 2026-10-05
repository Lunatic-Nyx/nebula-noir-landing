import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// Server-only secret crypto. Do NOT add a 'use server' directive: that would
// expose these functions as public RPC endpoints.
const PREFIX = 'enc'
const VERSION = 'v1'
const IV_BYTES = 12
const TAG_BYTES = 16
const KEY_PATTERN = /^[0-9a-fA-F]{64}$/

function getKey(): Buffer | null {
  const raw = process.env.SECRETS_ENCRYPTION_KEY
  if (!raw || !KEY_PATTERN.test(raw)) return null
  return Buffer.from(raw, 'hex')
}

export function isEncryptionConfigured(): boolean {
  return getKey() !== null
}

/**
 * AES-256-GCM. AAD binds the ciphertext to its logical key name so a stored
 * value cannot be swapped between entries. Returns null when no key is set.
 */
export function encryptSecret(name: string, plaintext: string): string | null {
  const key = getKey()
  if (!key) return null
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from(name, 'utf8'))
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [PREFIX, VERSION, iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

export function decryptSecret(name: string, payload: string): string | null {
  const key = getKey()
  if (!key) return null
  const parts = payload.split(':')
  if (parts.length !== 5 || parts[0] !== PREFIX || parts[1] !== VERSION) return null
  try {
    const iv = Buffer.from(parts[2], 'hex')
    const tag = Buffer.from(parts[3], 'hex')
    const data = Buffer.from(parts[4], 'hex')
    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES || data.length === 0) return null
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAAD(Buffer.from(name, 'utf8'))
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}
