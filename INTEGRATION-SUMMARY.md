# Integration Summary

Living snapshot of product status, schema, and services.

**Last reviewed:** 2026-10-05 · How-to: `USER_MANUAL.md` · Env: `.env.example` · License: proprietary.

## Product status

| Surface | Source | Live UI |
|---|---|---|
| Hero | Static + optional video URL | Existing hero, video behind |
| About | `brand_info` / fixtures | Existing AboutSection |
| Events | `events` | New section, existing card language; landing shows upcoming only (LOYG 2026-09-12) |
| Gallery | `gallery_images` + R2 / fixtures | Existing catalog chrome, no prices/cart |
| Instagram | `instagram_posts` / fixtures | Instagram Login API, `@nebula_noir.official` |
| i18n | `src/i18n/messages.ts` | DE default, EN cookie `nn-locale`; Cybergoth Industrial copy |
| Hero video | `brand_info.hero_video` + R2 `hero/` | Admin `/admin/hero`, scroll-scrub |
| Scroll | Lenis | Public pages, reduced-motion safe |
| Contact | `contact_inquiries` | Existing form |
| Legal | `src/lib/legal-content.ts` | Static routes |
| Shop | Etsy | Footer + detail CTA |
| Admin | Supabase Auth | `/login`, `/admin` |

## Demo Mode

Triggered when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. Reads: `src/lib/fixtures`. Writes: no-op.

## Schema rules

- UUIDs for app rows; Instagram media id is text PK.
- `published` gates public SELECT on gallery and events.
- `categories.slug` matches gallery filter values: `chokers`, `bracelets`, `rings`, `earrings`, `accessories`.
- `profiles.role` is `'admin'` or `'user'`.
- Contact: insert-only for anon.
- Instagram writes: service role only.
- `instagram_auth`: single-row token store, service role only.
- New auth users get `profiles.role = 'user'` via trigger.

## External services

| Service | Role |
|---|---|
| Vercel | Next.js host + cron |
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
