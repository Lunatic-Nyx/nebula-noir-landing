import type { NextConfig } from 'next'

// Next only needs eval in development (HMR/source maps); production runs without it.
const scriptSrc =
  process.env.NODE_ENV === 'production'
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

// Browser PUT goes to the account host or the virtual-hosted bucket host.
// CSP * matches one label, so bucket.account.r2.cloudflarestorage.com is listed explicitly.
function r2ConnectOrigins(): string[] {
  const raw = process.env.R2_ENDPOINT?.trim()
  if (!raw) return []
  let endpoint: URL
  try {
    endpoint = new URL(raw)
  } catch {
    return []
  }
  const origins = [endpoint.origin]
  const bucket = process.env.R2_BUCKET_NAME?.trim()
  if (bucket && endpoint.hostname.endsWith('.r2.cloudflarestorage.com')) {
    origins.push(`${endpoint.protocol}//${bucket}.${endpoint.hostname}`)
  }
  return origins
}

const r2Origins = r2ConnectOrigins().join(' ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      `connect-src 'self' https://*.supabase.co${r2Origins ? ` ${r2Origins}` : ''}`,
      "frame-src 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
