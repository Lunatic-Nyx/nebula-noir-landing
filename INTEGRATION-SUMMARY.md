# Integration Summary

Living snapshot of product status, schema, and services.

**Last reviewed:** 2026-10-07 · How-to: `USER_MANUAL.md` · Env: `.env.example` · License: proprietary.

## Product status

| Surface | Source | Live UI |
|---|---|---|
| Hero | Static + optional video URL | Existing hero, video behind |
| About | `brand_info` / fixtures | Existing AboutSection |
| Events | `events` | New section, existing card language; landing shows upcoming only (LOYG 2026-09-12) |
| Gallery | `gallery_images` + R2 / fixtures | Existing catalog chrome, no prices/cart |
| Instagram | `instagram_posts` / fixtures | Instagram Login API, `@nebula_noir.official` |
| i18n | `src/i18n/messages.ts` + `site_config.translations` | DE default, EN cookie `nn-locale`; overrides editable in admin |
| Hero video | `brand_info.hero_video` + R2 `hero/` | Admin `/admin/hero`, scroll-scrub |
| Scroll | Lenis | Public pages, reduced-motion safe |
| Contact | `contact_inquiries` | Existing form + Resend notification |
| Legal | `site_config.legal` → fallback `src/lib/legal-content.ts` | Editable in `/admin/content`, static routes |
| Shop | Etsy (`site_config.site.etsyUrl`) | Footer + detail CTA |
| Admin | Supabase Auth | `/login`, `/admin` (German-only backoffice) |

## Demo Mode

Triggered when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. Reads: `src/lib/fixtures`. Writes: no-op.

## Schema rules

- `supabase/reset.sql` is **additive and idempotent** (create-if-not-exists, no drops; never deletes application data). `scripts/db-migrate.mjs` applies it in one transaction on every Vercel **production** build via `vercel.json` (`SUPABASE_DB_URL`, session pooler); unset URL or non-production `VERCEL_ENV` = skip, `DB_MIGRATE_SKIP=1` = bypass, `npm run test:db` verifies the SQL. Baseline seed is one-time (sentinel `site_config._schema_seed_v1`).
- UUIDs for app rows; Instagram media id is text PK.
- `published` gates public SELECT on gallery and events.
- `categories` is the source for gallery filters; admin CRUD + `label_en`; `on delete restrict` blocks deleting a category that still has images (admin offers reassign).
- `profiles.role` is `'admin'` or `'user'`.
- Contact: insert-only for anon.
- Instagram writes: service role only.
- `instagram_auth`: single-row token metadata (`user_id`, `username`, `expires_at`); access token now lives encrypted in `api_secrets`.
- `site_config`: public-read key/value JSONB (`site`, `legal`, `footer`, `translations`); never store secrets here.
- `api_secrets`: admin-only RLS, AES-256-GCM (`SECRETS_ENCRYPTION_KEY`), runtime reads via service role.
- `rate_limits`: deny-all RLS; contact limiter via `consume_rate_limit()` (service role), keys are hashes.
- Consent: `nn-consent` cookie gates external fonts (Google Fonts); `nn-locale` and admin session cookies are necessary.
- New auth users get `profiles.role = 'user'` via trigger.

## External services

| Service | Role |
|---|---|
| Vercel | Next.js host + cron + build-time schema apply |
| Supabase | Postgres, Auth, RLS |
| Cloudflare R2 | Gallery + cached IG media |
| Resend | Contact-form notification email (`RESEND`, server-only) |
| Instagram API with Instagram Login (`graph.instagram.com`) | Media read (`instagram_business_basic`) |
| Etsy | Commerce (`etsy.com/shop/nebulanoirnn`) |
| Google Fonts | Poiret One, Cinzel, Montserrat |

## Data flow

1. `app/page.tsx` calls `src/lib/data.ts`.
2. Demo → fixtures. Prod → Supabase anon client.
3. Admin upload → auth check → R2 `PutObject` → `gallery_images` insert.
4. IG cron → Graph API → R2 copy → upsert `instagram_posts`.
5. Contact → server action → insert `contact_inquiries` → best-effort Resend notification (if `RESEND` set).

## Docs map

| File | Role |
|---|---|
| `USER_MANUAL.md` | Visitors + admin |
| `README.md` | Setup index |
| `AGENTS.md` | Freeze + architecture for agents |
| `PRD.md` | Current requirements |
| `DEPLOYMENT.md` | Hosting and third-party setup |
| `SECURITY.md` | RLS and secrets |
| `QA_CHECKLIST.md` | Manual tests |
| `THEME_INTEGRATION.md` | Kit vs live UI |
| `LICENSE` | Proprietary |
