import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { isR2Configured } from '@/lib/env'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

export const R2_MAX_BYTES = 10 * 1024 * 1024
export const R2_VIDEO_MAX_BYTES = 80 * 1024 * 1024

export function isAllowedImageType(mime: string): boolean {
  return ALLOWED_TYPES.has(mime)
}

export function isAllowedVideoType(mime: string): boolean {
  return ALLOWED_VIDEO_TYPES.has(mime)
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

export function publicObjectUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, '')
  return `${base}/${key}`
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = getR2Client()
  if (!client) throw new Error('R2 is not configured')
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
  return publicObjectUrl(key)
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()
  if (!client) throw new Error('R2 is not configured')
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  )
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'video/mp4':
      return 'mp4'
    case 'video/webm':
      return 'webm'
    case 'video/quicktime':
      return 'mov'
    default:
      return 'bin'
  }
}

export async function presignPut(key: string, contentType: string): Promise<string> {
  const client = getR2Client()
  if (!client) throw new Error('R2 is not configured')
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn: 120 })
}
