# Nebula Noir

Cybergoth / Industrial jewelry brand site. Gallery, events, Instagram, contact. Commerce stays on [Etsy](https://www.etsy.com/shop/nebulanoirnn).

Stack: Next.js 15 App Router, Supabase (Postgres + Auth + RLS), Cloudflare R2, Vercel Cron.

**License:** proprietary. All rights reserved. See `LICENSE`. This is not an open-source project.

**Last reviewed:** 2026-10-05

## Quick start (Demo Mode)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` empty. The landing page renders from `src/lib/fixtures`. Admin is a read-only preview; writes toast and no-op.

Production keys: fill `.env.local` from `.env.example`, then follow `DEPLOYMENT.md`.

```bash
npm run lint
npm run typecheck
npm run build
```

## What visitors see

1. Intro loading screen on every `/` visit
2. Hero (optional scrubbed background video)
3. Philosophy (`brand_info`)
4. Upcoming published events
5. Gallery with category filters (no prices, no cart)
6. Instagram grid (`@nebula_noir.official`)
7. Inquiry form → `contact_inquiries`
8. Static legal routes

Locale: German default, English via **DE / EN** (`nn-locale` cookie). How to use the site and admin: **`USER_MANUAL.md`**.

## Architecture (short)

| Path | Role |
|---|---|
| `app/` | Routes, API, cron |
| `src/components/` | Live UI — design freeze |
| `src/lib/data.ts` | Demo-aware reads |
| `src/lib/env.ts` | Demo / R2 flags |
| `src/i18n/` | DE/EN strings |
| `supabase/reset.sql` | Schema, RLS, seed |
| `.env.example` | Every supported variable |

Do not reintroduce GitHub Spark (`@github/spark`, `useKV`, Vite Spark plugins). CSS class names `spark-theme-*` are styling only.

## Docs

| File | Audience |
|---|---|
| `USER_MANUAL.md` | Visitors + operators (complete how-to) |
| `AGENTS.md` | Agents and developers — freeze, architecture |
| `PRD.md` | Current product requirements |
| `DEPLOYMENT.md` | Vercel, Supabase, R2, Instagram Login, hero |
| `SECURITY.md` | Secrets, RLS, uploads |
| `QA_CHECKLIST.md` | Manual pass/fail |
| `INTEGRATION-SUMMARY.md` | Schema and service map |
| `CHANGELOG.md` | Version history |
| `LESSONS_LEARNED.md` | Engineering notes |
| `THEME_INTEGRATION.md` | Frozen visual kit vs live tree |
| `LICENSE` | Proprietary terms |

## Scripts

| Script | Command |
|---|---|
| Dev | `npm run dev` |
| Production build | `npm run build` |
| Serve build | `npm run start` |
| Lint | `npm run lint` |
| Types | `npm run typecheck` |
