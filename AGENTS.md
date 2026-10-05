# AGENTS.md — Nebula Noir Landing

Read this file at the start of every session. Follow it before writing code.

## Product

Nebula Noir is a Cybergoth / Industrial / Cyberpunk / Dark Alternative jewelry brand site. Copy is hard and technical: faux leather, PVC, heavy chains, rivets, oversized rings, fluorescent neon. Audience: black scene, cosplay, nerd culture, festivals, club nights. Do not write Art Deco, 1920s, occult, or mystical copy. The live frontend was a GitHub Spark + Vite SPA. It is now a Next.js App Router app with Supabase (data + auth) and Cloudflare R2 (gallery media). Etsy remains the shop. This site is a gallery, brand, events, Instagram, and contact surface. Visual chrome (including `art-deco-*` CSS class names) stays frozen; the words do not.

## Design Freeze (absolute)

The existing frontend look is sacred.

- Do not change colors, fonts, animations, or layouts of existing components.
- Do not reduce Framer Motion animations.
- Do not edit Tailwind className strings on existing elements unless a confirmed bug requires it.
- Do not restyle `src/index.css`, `src/styles/theme.css`, or `src/themes/nebula-noir-theme/styles.css`.
- Fonts stay Poiret One, Cinzel, and Montserrat via the existing Google Fonts URL. Do not switch to `next/font`.
- Do not add `class="dark"` or `data-appearance="dark"` on `<html>`. Token overrides live in `src/index.css` `:root`.
- New UI must reuse existing classes: `bioshock-glow`, `bioshock-glow-animated`, `metallic-border`, `art-deco-*`, `spark-theme-*`, `nebula-glow-hover`.
- `spark-theme-*` CSS class names are styling, not GitHub Spark. Keep them.

Allowed exceptions (product decisions):

- Shopping cart, checkout, and prices are removed from the live UI (gallery, not shop).
- Legal content moved from dialogs to static routes. Footer link classes stay the same.
- New sections (Events, Instagram, Admin, Hero video layer) must match existing section language.

## Architecture

- Next.js App Router at `app/`. Shared UI and libs at `src/`.
- Path alias `@/*` → `src/*`.
- Client island: `src/components/HomePage.tsx` owns the landing experience (loading screen, cursor glow consumers, motion sections). Intro plays on every `/` visit.
- Smooth scroll: Lenis in `src/components/SmoothScroll.tsx` (public pages only).
- Server components fetch in `app/page.tsx` via `src/lib/data.ts`.
- Demo Mode: if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, all reads use `src/lib/fixtures/`. Mutations no-op with a user-visible toast.
- R2 uploads only on the server. Never expose R2 secrets to the client.
- Instagram: **Instagram API with Instagram Login** only (`graph.instagram.com`, scope `instagram_business_basic`). No Facebook Login, no Messenger. Syncs media into `instagram_posts`. Handle: `@nebula_noir.official`.
- i18n: German default, English via `LocaleProvider` + `src/i18n/messages.ts`. Cookie `nn-locale`. Do not hardcode user-facing UI strings. Admin overrides for public strings live in `site_config.translations` (`src/i18n/paths.ts` allowlist, `src/i18n/overrides.ts` loader); unknown/empty paths are discarded.
- Consent: the `nn-consent` cookie gates external content. Google Fonts (and preconnects) render only when `external` is allowed; otherwise system fonts. Do not load third-party assets unconditionally. Banner + reset link: `src/components/CookieConsent.tsx`, `ConsentSettingsLink.tsx`, logic in `src/lib/consent.ts`.
- Admin: Supabase Auth email/password + `profiles.role = 'admin'` + RLS. Admin is a **German-only** operator surface (`getAdminT()`), independent of the public locale cookie. Everything visitor-facing is editable there: site links, i18n overrides, legal texts, categories, gallery/events/brand texts, hero video, inquiries.
- Admin secrets: `RESEND`/Instagram/contact keys can be stored encrypted in `api_secrets` (AES-256-GCM, `SECRETS_ENCRYPTION_KEY`) and edited at `/admin/secrets`; env is the fallback. `site_config` is public-read and must never contain secrets. Server-only modules (`src/lib/secrets/**`, `src/lib/email.ts`, `src/lib/site-config.ts`, `src/lib/admin-gate.ts`) must not get a `'use server'` directive.
- License: proprietary (`LICENSE`). Do not reintroduce MIT or GitHub, Inc. copyright.

## Spark is gone

Do not reintroduce `@github/spark`, `useKV`, Spark Vite plugins, `spark.meta.json`, or `runtime.config.json`.

## Session workflow (mandatory)

1. Read this file.
2. Implement only the requested work. Preserve design freeze.
3. Before declaring a task done, update every relevant root markdown file:
   - `AGENTS.md` (this file, if rules changed)
   - `README.md` / `.env.example` (if setup or variables changed)
   - `USER_MANUAL.md` (if visitor or admin flows changed)
   - `PRD.md` (if product scope changed)
   - `QA_CHECKLIST.md`
   - `CHANGELOG.md`
   - `LESSONS_LEARNED.md`
   - `SECURITY.md`
   - `DEPLOYMENT.md`
   - `INTEGRATION-SUMMARY.md`
   - `THEME_INTEGRATION.md` (if the visual kit vs live tree changed)
   - `LICENSE` (if terms changed)
4. Run lint and typecheck.
5. Do not wait for the user to ask for documentation updates.

## Key paths

| Path | Role |
|---|---|
| `app/` | Routes, API, cron |
| `src/components/` | Live UI (freeze) |
| `src/lib/data.ts` | Demo-aware data access |
| `src/lib/env.ts` | Env + demo flags |
| `src/lib/site-config.ts` | `site_config` readers (site/legal) with code fallbacks |
| `src/lib/secrets/` | AES-256-GCM crypto + encrypted secret store |
| `src/i18n/paths.ts` | Overridable message path allowlist |
| `src/i18n/overrides.ts` | Per-request translation override loader |
| `src/lib/admin-gate.ts` | Shared `requireAdmin()` guard for server actions |
| `src/lib/supabase/` | Browser, server, service clients |
| `src/lib/r2.ts` | R2 uploads |
| `supabase/reset.sql` | Schema, RLS, seed |
| `.env.example` | All supported variables (required vs optional marked) |
| `USER_MANUAL.md` | Visitor + admin how-to |
| `LICENSE` | Proprietary, all rights reserved |
