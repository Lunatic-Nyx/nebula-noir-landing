# Security

**Last reviewed:** 2026-10-07

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
- `SUPABASE_DB_URL` — optional direct Postgres connection string (session pooler, contains the DB password); build/deploy only, never client. If unset, the runner reuses the Vercel Supabase integration's Postgres vars (`POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, `DATABASE_URL`, `POSTGRES_PRISMA_URL`). Used by `scripts/db-migrate.mjs`.
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
| `rate_limits` | none | Deny-all; only `consume_rate_limit()` (SECURITY DEFINER) and the service role |
| `profiles` | none | SELECT own row; admin role set only via SQL/service |

Admin check: JWT user id exists in `profiles` with `role = 'admin'`.

Service role is used only in:

- `src/lib/supabase/service.ts`
- Instagram cron/sync route
- Never `createBrowserClient` with the service key

## Deploy-time database access

`scripts/db-migrate.mjs` runs during the Vercel build (`vercel.json` `buildCommand`) before `next build` and applies `supabase/reset.sql` over a direct Postgres connection. It tries `SUPABASE_DB_URL` first, then the Vercel Supabase integration's `POSTGRES_URL_NON_POOLING` / `POSTGRES_URL` / `DATABASE_URL` / `POSTGRES_PRISMA_URL`, until one connects. Because the file is additive and idempotent, this cannot drop tables and does not delete application data (only the runtime rate limiter prunes expired buckets); it creates missing objects and seeds baseline rows once. `supabase/reset.sql` is privileged code: protect `supabase/**` with branch protection/CODEOWNERS.

- The connection string contains the Postgres password. Store any explicit `SUPABASE_DB_URL` as a **Production-scoped** encrypted Vercel variable; never `NEXT_PUBLIC_`, never in client code, never committed. The integration-provided `POSTGRES_*` vars are managed by Vercel/Supabase and are likewise never client-exposed.
- Preview/Development builds skip the apply even if the variable is present (`VERCEL_ENV` gate), so a branch build cannot mutate production. `DB_MIGRATE_ALLOW_PREVIEW=1` is the explicit override.
- The script never logs the URL or password (redacted in errors).
- The whole file runs in one transaction with a cross-deploy advisory lock; on error it rolls back, so a half-applied schema is never left behind. By default a connectivity/configuration failure only warns and the deployment continues; set `DB_MIGRATE_REQUIRED=1` to fail the build instead. `DB_MIGRATE_SKIP=1` is the emergency bypass.
- Use the Supabase **Session pooler** (IPv4) URL, not the Direct connection (`db.<ref>.supabase.co`, IPv6-only, unreachable from Vercel).
- TLS stays on: use Supabase's `?sslmode=require` (verified). The runner rejects `sslmode=disable`, `sslmode=no-verify` and `uselibpqcompat` for remote hosts; do not disable TLS for the production database.
- The role must be privileged enough to create the trigger on `auth.users` and run `create extension`; the session-pooler `postgres` role qualifies. Do not use the transaction pooler (port 6543) for this.
- `npm run test:db` verifies the SQL's idempotency and convergence against in-memory Postgres without touching any real database.

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

`next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, HSTS and a Content-Security-Policy (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, inline scripts/styles for Next/Tailwind, fonts from `fonts.gstatic.com`, images/media over HTTPS, `connect-src` to Supabase).

## Rate limiting

The contact action enforces 5 requests / 10 minutes per hashed IP+email via `public.consume_rate_limit()` (table `rate_limits`, deny-all RLS, `SECURITY DEFINER`, execute revoked from `public`/`anon`/`authenticated`, granted to `service_role` only). The function rejects out-of-range parameters and opportunistically deletes expired rows, so an abusive caller cannot poison buckets or grow the table unbounded. The hashed key is stored, never the raw IP. The limiter fails open when Supabase/service role is missing so a misconfiguration cannot block the form. This complements — but does not replace — an edge/WAF limit before enabling `RESEND`.

## Server-only modules

`src/lib/secrets/**`, `src/lib/email.ts`, `src/lib/site-config.ts`, `src/lib/admin-gate.ts`, `src/lib/health.ts`, `src/lib/instagram.ts`, `src/lib/r2.ts` and the Supabase clients import `server-only`, so a client import fails the build. None of them may carry a `'use server'` directive.

## Contact form

Validate name/email/message server-side. Truncate oversized payloads. RLS INSERT is not a substitute for rate limiting (add WAF/Vercel firewall in production).

When `RESEND` is set, a best-effort notification email is sent server-side via `https://api.resend.com` after the inquiry is stored. The API key is server-only, never returned to the client, and is not logged. A mail failure never fails the form and never loses the stored inquiry. Before enabling `RESEND` in production, put an edge/WAF rate limit in front of the public contact action — otherwise anyone can drive outbound email to the operator (inbox spam, Resend quota).

## Auth

- Email/password via Supabase Auth
- Middleware gates `/admin`
- Demo Mode has no real auth; admin writes are no-ops
