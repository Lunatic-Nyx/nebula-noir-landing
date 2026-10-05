# Security

**Last reviewed:** 2026-10-05

The repository is proprietary (`LICENSE`). Do not publish exploits, dump env files, or file public GitHub issues for vulnerabilities. Email the site operator (see Impressum / `contact@nebula-noir.com`).

## Reporting

Do not file public GitHub issues for vulnerabilities. Email the site operator (see Impressum).

## Environment variables

### Public (`NEXT_PUBLIC_*`)

Safe to ship to the browser:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (RLS-enforced)
- `NEXT_PUBLIC_HERO_VIDEO_URL`

### Secret (server only)

Never prefix with `NEXT_PUBLIC_`. Never import into client components.

- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; cron + admin server actions only
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`
- `INSTAGRAM_ACCESS_TOKEN` (Instagram Login user token), `INSTAGRAM_APP_SECRET`
- `RESEND` (Resend API key; contact-form notification email only)
- `CRON_SECRET`

`R2_PUBLIC_URL` is not a credential but is server-used when writing object URLs.

`INSTAGRAM_APP_ID` is optional documentation for the Meta dashboard; the app does not read it at runtime. `INSTAGRAM_APP_SECRET` is for the short-lived → long-lived token exchange only (`DEPLOYMENT.md`). Complete list and comments: `.env.example`.

## Supabase RLS (see `supabase/reset.sql`)

| Table | anon | authenticated admin |
|---|---|---|
| `categories` | SELECT | ALL |
| `gallery_images` | SELECT where `published` | ALL |
| `events` | SELECT where `published` | ALL |
| `brand_info` | SELECT | ALL |
| `instagram_posts` | SELECT | SELECT (writes via service role) |
| `instagram_auth` | none | none (service role only) |
| `contact_inquiries` | INSERT | SELECT, UPDATE, DELETE |
| `site_config` | SELECT | ALL — public read; never store secrets here |
| `api_secrets` | none | ALL (runtime reads use the service role) |
| `profiles` | none | SELECT own row; admin role set only via SQL/service |

Admin check: JWT user id exists in `profiles` with `role = 'admin'`.

Service role is used only in:

- `src/lib/supabase/service.ts`
- Instagram cron/sync route
- Never `createBrowserClient` with the service key

## R2 upload limits

- Images: max 10 MB; JPEG/PNG/WebP/GIF (SVG intentionally rejected); `gallery/{uuid}.{ext}`
- Hero video: max 80 MB; MP4/WebM/MOV; `hero/{uuid}.{ext}` via 120s presigned PUT (admin only)
- Auth: admin session required for all uploads
- No public write on the bucket; Next.js server uses S3-compatible credentials

## Secret store (admin-editable keys)

`RESEND`, Instagram and contact addresses can be stored encrypted in `api_secrets` and edited under **Admin → API-Keys**:

- AES-256-GCM (`src/lib/secrets/crypto.ts`), key from `SECRETS_ENCRYPTION_KEY` (64 hex chars), format `enc:v1:<iv>:<tag>:<cipher>`, AAD = logical key name.
- Writes go through admin-gated server actions + service role; the client only ever sees `db`/`env`/`missing` status, never a value or ciphertext.
- Runtime resolution is DB (decrypted) → environment fallback. `site_config` is public-read and must never contain secrets.
- Losing or rotating `SECRETS_ENCRYPTION_KEY` makes stored values unreadable (env fallbacks keep working); encrypted entries must be re-entered.
- Legal HTML written through the admin editor is sanitized on write (scripts/iframes/event handlers/`javascript:` URLs stripped) as defense in depth; admin-only RLS remains the primary trust boundary.

## Cron

`/api/cron/instagram` requires `Authorization: Bearer $CRON_SECRET` (constant-time compare). Vercel Cron sends this header automatically when the `CRON_SECRET` env var is set. If the variable is missing or the header does not match, the route returns 401. The spoofable `x-vercel-cron` header is not trusted.

## HTTP security headers

`next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and HSTS for all routes.

## Contact form

Validate name/email/message server-side. Truncate oversized payloads. RLS INSERT is not a substitute for rate limiting (add WAF/Vercel firewall in production).

When `RESEND` is set, a best-effort notification email is sent server-side via `https://api.resend.com` after the inquiry is stored. The API key is server-only, never returned to the client, and is not logged. A mail failure never fails the form and never loses the stored inquiry. Before enabling `RESEND` in production, put an edge/WAF rate limit in front of the public contact action — otherwise anyone can drive outbound email to the operator (inbox spam, Resend quota).

## Auth

- Email/password via Supabase Auth
- Middleware gates `/admin`
- Demo Mode has no real auth; admin writes are no-ops
