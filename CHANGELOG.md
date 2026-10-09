# Changelog

All notable changes to this project are documented in reverse chronological order.

## [0.7.1] — 2026-10-07

### Fixed

- Mobile sheet navigation now uses full mobile viewport width/height with contained overscroll, padding, and safer link wrapping, preventing the half-covered page/menu state seen on narrow Android viewports.
- The decorative animated frame now sits below interactive layers, so it no longer draws over the mobile menu or product dialogs.
- Product detail dialogs use `100dvh`-based max height, contained internal scrolling, tighter mobile padding, and safer title/category/button wrapping.
- Long mobile headings, category filters, event titles, and footer copyright text now wrap inside the viewport instead of creating clipped or horizontal-scroll layouts.

## [0.7.0] — 2026-10-07

### Changed

- **Fonts are now self-hosted and preloaded** (`public/fonts/poiret-one-latin-400.woff2`, `public/fonts/montserrat-latin.woff2` variable 300–600; `@font-face` in `src/styles/fonts.css`; `<link rel="preload">` in `app/layout.tsx`). No request to Google; Cinzel removed as unused. This fixes the fallback-font flash: the `'Poiret One', cursive` stack rendered as **Comic Sans** on Windows without consent, and even with consent the cross-origin load flashed before swapping.
- **Consent banner retired.** Its only purpose was gating Google Fonts; self-hosted fonts are same-origin and need no consent. Removed `CookieConsent.tsx`, `ConsentSettingsLink.tsx`, `src/lib/consent.ts`, the `consent.*` i18n keys, and the footer "Cookie-Einstellungen" link. Visitor cookies are now only `nn-locale` (plus the Supabase admin session).
- Datenschutz default text updated (fonts self-hosted, no `nn-consent`, Google removed from the processor list). CSP tightened: `style-src`/`font-src` no longer allow Google hosts.
- `LoadingScreen` waits (bounded to 1.5 s) for `document.fonts.ready` before revealing the site.

### Note

- If the Datenschutz was edited in Admin → Texte & Übersetzungen → Rechtstexte, that saved override wins over the code default — re-save it to pick up the new wording.

## [0.6.9] — 2026-10-07

### Changed

- Reduced the public module surface: un-exported helpers and types that are only used inside their own module (`CONSENT_VERSION`, `ConsentState`, `DEFAULT_CATEGORIES`, `DEFAULT_FOOTER_CONFIG`, `isSafeHref`, `DEFAULT_PUBLIC_SITE_CONFIG`, `MAX_PRODUCT_NOTICE`, `productsToGallery`, `invalidateSecretsCache`, `SecretsSnapshot`, `SecretMutationResult`, `resolveActiveNavItem`, `AdminNavItem`, `AdminNavGroup`, `ServerT`, `AdminGate`, `HealthCheck`, `SendEmailResult`, and the `*Result` action types) and dropped the unused type re-exports in `src/lib/site-config.ts`.
- Removed the dead `MessageTree` type (`src/i18n/messages.ts`) and `ApiSecretMeta` interface (`src/lib/secrets/catalog.ts`).

No behavior change. The shadcn UI primitives keep their exports (library surface).

## [0.6.8] — 2026-10-07

### Changed

- Removed 39 unused dependencies left over from the Spark/Vite + shadcn scaffold: unused `@radix-ui/react-*` packages (only `dialog`, `label`, `slot` remain), `@radix-ui/react-separator` etc., `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `recharts`, `date-fns`, `embla-carousel-react`, `input-otp`, `cmdk`, `react-day-picker`, `react-resizable-panels`, `vaul`, `@heroicons/react`, `next-themes`, `uuid`, `zod`, `@tailwindcss/container-queries`. No source imports them.
- Removed dead exports `isTranslationPath` (`src/i18n/paths.ts`) and `getApiSecret` (`src/lib/secrets/store.ts`); trimmed the unused lucide deep-import type shim to its wildcard declaration.

### Verified

- `lint`, `typecheck`, `test:db`, `build` all pass (17/17 pages); `knip` reports no remaining unused production dependency.

## [0.6.7] — 2026-10-07

### Added

- New legal section **Produkthinweise** (`/produkthinweise`): material, care, made-to-order, safety and GPSR manufacturer notes. Editable in Admin → Texte & Übersetzungen → Rechtstexte (DE/EN, HTML) like the other legal pages, with a code default. Added to the default footer legal column; `footer.productNotes` is overridable.

### Note

- A footer link to a path with no matching route still returns 404. Use the built-in `/produkthinweise` page or an external URL.

## [0.6.6] — 2026-10-07

### Added

- Per-product notice: new `gallery_images.notice` column (additive/idempotent in `supabase/reset.sql`), editable in Admin → Galerie (upload + inline edit) and shown in the public product dialog.
- Global product notice (DE/EN) in `site_config.site.productNotice`, editable under Admin → Texte & Übersetzungen → Website, shown in the product dialog for every item.
- `catalog.notice` UI label (DE/EN).

### Note

- Legal content (Impressum, Datenschutz, AGB, Widerruf, Versand, Custom Orders, Über uns) and footer/legal links were already editable in Admin → Texte & Übersetzungen (Rechtstexte / Footer); no change needed there.

## [0.6.5] — 2026-10-07

### Changed

- The deploy-time schema apply is **best effort by default**: a missing or unreachable Postgres URL logs a warning and the deployment continues, instead of failing the build. Set `DB_MIGRATE_REQUIRED=1` (recommended on the schema-owning project) to fail the build on any error.
- Documented clearly: use the Supabase **Session pooler** (IPv4) URL. The **Direct connection** (`db.<ref>.supabase.co:5432`) is IPv6-only and cannot connect from a Vercel build — this is why a deployment using the direct URL failed.

## [0.6.4] — 2026-10-07

### Changed

- Deploy-time schema apply no longer requires a manually created `SUPABASE_DB_URL`: the runner also uses the Vercel Supabase integration's Postgres connection strings (`POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, `DATABASE_URL`, `POSTGRES_PRISMA_URL`), trying them in order until one connects. `SUPABASE_DB_URL` remains the preferred override.
- The advisory lock is inlined (no bound parameter), so the runner's queries stay simple and also work behind the transaction pooler.

## [0.6.3] — 2026-10-07

### Added

- Deploy-time schema apply: `scripts/db-migrate.mjs` runs `supabase/reset.sql` on every Vercel **production** build (`vercel.json` `buildCommand`) over the session-pooler connection string `SUPABASE_DB_URL`. It runs in one transaction with a cross-deploy advisory lock and fails the build (rollback) on error. It reads `.env.local` for local manual runs.
- Guards: skip when the URL is unset (local/Demo/Preview); skip on non-production `VERCEL_ENV` unless `DB_MIGRATE_ALLOW_PREVIEW=1`; fail the build on a production build that uses Supabase but has no DB URL; reject `sslmode=disable` for remote hosts; redact the password from errors; emergency bypass `DB_MIGRATE_SKIP=1`.
- `npm run db:migrate` (manual/local) and `npm run test:db` (in-memory Postgres verification of idempotency/convergence via PGlite).
- CI workflow (`.github/workflows/ci.yml`) running `npm ci`, `npm run test:db`, `npm run lint`, `npm run typecheck`, `npm run build` on push to `main` and PRs.
- Guards include refusing `sslmode=disable`/`sslmode=no-verify`/`uselibpqcompat` for remote hosts.
- Duplicate-safe constraint convergence: the runner's SQL recreates the `categories.slug`/`brand_info.key` unique indexes the admin `onConflict` paths rely on, and skips creation (with a warning) instead of aborting when a corrupt legacy table contains duplicates.

### Changed

- `supabase/reset.sql` is now **additive and idempotent**: `create table/column/index if not exists`, `create or replace` functions, drop-if-exists + create policies, and a one-time baseline seed guarded by the `site_config` sentinel `_schema_seed_v1` (so deploys no longer re-insert deleted baseline rows or duplicate renamed ones). It no longer drops tables or deletes application data, so it is safe to run repeatedly, on a live database, and on every deployment.
- `vercel.json` gains `buildCommand` (`node scripts/db-migrate.mjs && next build`).
- `package.json` adds the `pg` dependency, `@electric-sql/pglite` dev dependency, and the `db:migrate`/`test:db` scripts.
- `.gitignore` ignores `.env*` (except `.env.example`), covering `.env.production`/`.env.staging` etc.
- Docs (`AGENTS.md`, `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, `INTEGRATION-SUMMARY.md`, `USER_MANUAL.md`, `QA_CHECKLIST.md`, `LESSONS_LEARNED.md`) describe the new flow.

## [0.6.2] — 2026-10-05

### Added

- Footer is fully editable in **Admin → Texte & Übersetzungen → Footer**: columns, links (label DE/EN, URL, external), order (↑/↓), add/remove, brand blurb, copyright and made-in. Defaults match the previous footer; the Etsy link is just the default and can be renamed/replaced (`site_config.footer`).
- Back button on all legal/info pages.

### Fixed

- `.art-deco-divider` is centered again: the frozen `index.css` rule (`margin: 4rem 0`, unlayered) overrode Tailwind's layered `mx-auto`, left-aligning the divider under Catalog/Instagram.
- Loading-screen moon accents no longer overlap the corner brackets.
- Product cards in a row share the same height; the category/Details footer is aligned across cards.

## [0.6.1] — 2026-10-05

### Added

- Cookie/consent banner (`nn-consent`) with "accept all" / "necessary only" and a footer "Cookie-Einstellungen" link. Google Fonts (and its preconnects) load only after consent; without consent system fonts are used.
- Complete Impressum and Datenschutzerklärung templates covering all processors (Vercel, Supabase, Resend, Cloudflare R2, Google, Meta, Etsy), legal bases, cookies/consent, retention and rights. Operator identity fields are marked `[[…]]`; the admin warns while placeholders remain.
- Contact-form rate limit (5 requests / 10 min per hashed IP+email) via `consume_rate_limit` (Deny-all table, SECURITY DEFINER, service role only) with fail-open when Supabase is unconfigured.
- `server-only` guards on all server modules; Content-Security-Policy added to the security headers.

### Changed

- Datenschutz reflects the consent-gated fonts and the EU ODR platform being discontinued (Impressum no longer links `ec.europa.eu/odr`).

### Fixed

- `consume_rate_limit` now revokes `EXECUTE` from `public` as well (Postgres grants it to PUBLIC by default), rejects out-of-range parameters, and cleans expired rows.
- Consent cookie sets `Secure` on HTTPS.
- AGB §11 no longer links the discontinued EU ODR platform.
- Gallery seed uses local `/demo/instagram/*.jpg` instead of `images.unsplash.com` (no undeclared third-party requests).
- Internal maintenance notes removed from the public legal texts.
- Production CSP no longer allows `'unsafe-eval'`.
- Restored UTF-8 German strings in `email.ts`, `health.ts` and `secrets/store.ts` (mojibake from an encoding round-trip) and stripped BOMs from the server-only modules.
- Contact/Catalog headings use a smaller base size/tracking so the system-font fallback (no font consent) cannot break words at 320px.
- `useScrollTrigger` clamps its intersection threshold to a reachable ratio, so very tall sections (catalog at 320px) reveal on scroll instead of staying invisible.

## [0.6.0] — 2026-10-05

### Added

- Admin backoffice: grouped sidebar nav with mobile drawer (German-only), dashboard with counts/status, and new pages `/admin/content`, `/admin/categories`, `/admin/secrets`, `/admin/health`.
- Site config (`site_config`): public links editable, full DE/EN i18n overrides, and legal texts (Impressum, Datenschutz, AGB, Widerruf, Versand, Custom Orders, Über uns) editable with code fallbacks.
- Data-driven categories: DB CRUD with reassign-on-delete; the public catalog consumes DB categories.
- Encrypted secret store (`api_secrets`, AES-256-GCM via `SECRETS_ENCRYPTION_KEY`) with env fallback and a write-only admin UI for Resend/Instagram/contact keys.
- Health checks (Supabase, R2, Resend, Instagram, config) with latency and status.
- Full editors: gallery (title/description/category/published/sort), events (incl. unpublished + edit), and brand_info keys (create/delete).

### Changed

- Admin is German-only; the public DE/EN switch no longer affects admin pages.
- `getCategories` returns `[]` on DB errors (fixtures only in Demo Mode); category labels come from the DB first.
- Instagram sync stores refreshed tokens encrypted when possible and blanks the legacy plaintext column.
- Legal HTML is sanitized on write (defense in depth).
- `ArtDecoCorner` resets margins (`m-0!`) so `space-y` cannot displace the absolute corner decoration.

### Fixed

- Event editor timezone shift on save; admin gallery edit no longer resets `published`/`sort_order`; admin headings no longer flip to English with `nn-locale=en`; legal pages never render blank after clearing a field.

## [0.5.0] — 2026-10-05

### Added

- Contact form sends a best-effort notification email via Resend (`RESEND`, server-only; optional `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL`). The inquiry is always stored in Supabase; a mail error/timeout is logged and never fails the form. Implemented with direct `fetch` — no new dependency.
- Datenschutz §6 names Resend and the possible US transfer; §9 also names Cloudflare R2 as media storage.

### Changed

- Contact heading uses responsive size/tracking so `MASSANFERTIGUNGEN` fits on phones instead of breaking mid-word.

## [0.4.1] — 2026-10-05

### Fixed

- Responsive overlaps/clipping found by a full mobile+desktop audit (320–1920, verified in real Chrome):
  - `#contact` / `#catalog` headings now wrap instead of being clipped on phones (`break-words`).
  - Legal headings (e.g. "Verbraucherstreitbeilegung") wrap — via a higher-specificity `.legal-content h1–h4` rule, without touching the frozen `index.css`.
  - Product detail dialog: footer row wraps, the "Anfrage senden" CTA is always fully visible (320–1536), and the dialog is capped at `max-w-6xl` on large screens.
  - Mobile hamburger sheet scrolls in landscape (`overflow-y-auto`, `overflow-x-hidden`).
  - Hero uses a deterministic `100svh` height (`@supports` upgrade from `100vh`).
  - Loading screen scales down on small/flat viewports; admin inquiry email wraps.

### Changed

- Centralized repeated values as SSOT: `src/lib/design.ts` (`IMAGE_FILTER`, `TOAST_STYLE`, `SCROLL_OFFSET_VAR`), `src/lib/motion.ts` (`EASE_DECO`, replacing 27 inline easing arrays), and `--nn-scroll-offset` in `src/main.css` (replacing six hardcoded `7rem`).

## [0.4.0] — 2026-10-05

### Added

- `src/i18n/translate.ts` + `src/i18n/server.ts`; admin UI, contact errors, `ProductCard` and the product dialog now localize via `t()` so the DE/EN toggle reaches admin chrome.
- Admin delete for contact inquiries (`deleteInquiry`) plus the `contact_admin_delete` RLS policy (right to erasure in practice).
- HTTP security headers (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) in `next.config.ts`.

### Changed

- `/api/cron/instagram` accepts only `Authorization: Bearer $CRON_SECRET` with a constant-time compare; removed the spoofable `x-vercel-cron` trust.
- Hero video: the previous R2 object is deleted only after a successful DB write; `confirmHeroVideo` validates the `hero/` key and derives the public URL server-side.
- Gallery upload removes the R2 object when the database insert fails.
- `getBrandInfo` no longer falls back to fixtures when Supabase is configured.
- Instagram sync: single `extensionForMime` call; a failed token refresh no longer wipes the stored `expires_at`.
- `useParallax` coalesces scroll work through `requestAnimationFrame`.
- Datenschutz/AGB text aligned with the Etsy-only, no-cart product (LocalStorage cart removed, false analytics/consent claims corrected, `nn-locale` declared); Impressum reference TMG → DDG.

### Fixed

- Duplicate close button in the product detail dialog.

### Removed

- Unused Spark-era theme-kit slots and `sparkTheme` registry, 38 unused `src/components/ui/*` components, `use-mobile`, `theme.json`, `.spark-initial-sha`, the duplicate `src/assets` logo, unused exports/types, and unused `next.config` image patterns.
- `image/svg+xml` from the allowed gallery upload types.

## [0.3.4] — 2026-09-10

### Changed

- License is proprietary (all rights reserved). The Spark-era MIT text attributed to GitHub, Inc. is closed.
- Root docs aligned to the live product: `README.md`, `PRD.md`, `THEME_INTEGRATION.md`, theme kit README, `DEPLOYMENT.md`, `SECURITY.md`, `QA_CHECKLIST.md`, `INTEGRATION-SUMMARY.md`, `AGENTS.md`.
- `.env.example` documents every variable (required vs optional, Demo Mode, unused-at-runtime Meta app id).

### Added

- `USER_MANUAL.md` — complete visitor and admin handbook (DE, with English operator notes).

## [0.3.3] — 2026-09-09

### Added

- Lenis smooth wheel scroll on public pages (`respectReducedMotion`, dialogs/sheets skipped, stopped during intro).

### Fixed

- Loading screen plays on every visit to `/` (sessionStorage skip removed). Body scroll locked for the intro.

## [0.3.2] — 2026-09-09

### Changed

- Brand copy is Cybergoth / Industrial / Cyberpunk / Dark Alternative only. No Art Deco, 1920s, occult, or mystical wording.
- Public copy names materials: Kunstleder, PVC, Ketten, Nieten, große Ringe, Neon. Audience: schwarze Szene, Cosplay, Nerdkultur.
- Crescent moons open upward (U / half-moon), including CSS dividers and loading frame.
- Nav label `Maßanfertigung` → `Anfragen`; desktop links from `xl` so DE/EN no longer collide.
- Product card footer no longer overlaps category + Details.

### Added

- LOYG Festival (Let Out Your Geek), Bochum, 12 Sep 2026, 14–22, Bochumer Eventcenter. Public events list hides past stands.

### Fixed

- Loading SVG no longer uses `calc()` on `<text>`/`<line>` (console length errors).
- Product detail `DialogContent` has a `Description`; mobile nav sheet has title + description.

## [0.3.1] — 2026-09-09

### Added

- Admin **Hero-Video**: scrubbable background uploaded to R2 (presigned PUT), URL in `brand_info.hero_video`.

### Removed

- Bundled `public/hero.mp4`. Without an upload the Art Deco pattern stays.

## [0.3.0] — 2026-09-09

### Added

- DE/EN locale switcher (`nn-locale` cookie). UI chrome is no longer hardcoded.
- Demo gallery/Instagram media from local `Demo images` (converted JPEG) plus hero clip `public/hero.mp4`.
- Favicon from the Nebula Noir logo (`app/icon.svg`, `public/favicon.svg`).

### Fixed

- Headings no longer split mid-word (`MASSANFERTIGUNGE / N`); long titles wrap on `\n`.
- Mobile: smaller heading tracking, native cursor on touch, hamburger until `lg`, form `overflow-hidden`.

## [0.2.3] — 2026-09-09

### Fixed

- Contact and login forms block double submit; Demo Mode contact toast is honest.
- Mobile nav closes on link tap; Instagram control is a single interactive element.
- Hash links clear the fixed nav (`scroll-padding` / `scroll-margin`).
- Intro loading screen plays once per session.
- Hero video waits for `loadedmetadata`, scrubs on rAF, hides on error.
- Card grayscale hover no longer overridden by inline `filter`.
- Event `datetime-local` values stored as ISO; admin lists `router.refresh` instead of full reload.
- Gallery upload revalidates `/` and `/admin/gallery`.
- Cursor glow skipped on coarse pointers.

### Removed

- Unused shop/alternate components (`CartDrawer`, `CheckoutDialog`, `LegalPage`, `Hero`, `About`, `Footer`, `Showcase`, `ErrorFallback`).

## [0.2.2] — 2026-09-09

### Added

- Gallery seed in `reset.sql` (same 12 artifacts as fixtures).
- `profiles` insert trigger on `auth.users`.
- `instagram_auth` row for refreshed Instagram Login tokens.

### Fixed

- Empty Events/Instagram no longer insert extra section dividers.
- Live Supabase reads no longer fall back to Instagram/gallery fixtures when tables are empty.

## [0.2.1] — 2026-09-09

### Changed

- Instagram sync uses Instagram API with Instagram Login only (`graph.instagram.com/v22.0/{user-id}/media`).
- Token-only config: `INSTAGRAM_USER_ID` optional (`GET /me`).
- Carousel and video posts store a still (thumbnail / first image), copied to R2 when configured.

## [0.2.0] — 2026-09-09

### Added

- Next.js App Router application shell (`app/`).
- Supabase schema (`supabase/reset.sql`) for gallery, categories, contact, brand info, events, Instagram cache, admin profiles.
- Cloudflare R2 upload path for gallery images (server-only).
- Demo Mode when Supabase public env vars are missing.
- Dynamic gallery (former catalog UI without shop chrome).
- Instagram section + cron sync for `@nebula_noir.official`.
- Contact form persistence to `contact_inquiries`.
- CMS-backed brand info + events list.
- Static legal routes (Impressum, Datenschutz, AGB, Widerruf, Versand, Custom Orders, Über uns).
- Scrubbable hero video layer behind the existing hero content.
- Supabase Auth admin (`/login`, `/admin/*`).
- Root documentation set: `AGENTS.md`, `QA_CHECKLIST.md`, `SECURITY.md`, `DEPLOYMENT.md`, `INTEGRATION-SUMMARY.md`, `LESSONS_LEARNED.md`.
- `.env.example` with Supabase, R2, Instagram, cron, and hero variables.

### Changed

- Cart, checkout, and prices removed from the live UI (gallery, not shop). Etsy remains commerce.
- Footer legal entries are static pages instead of dialogs.
- `useKV` cart persistence replaced; no client Spark KV.

### Removed

- GitHub Spark runtime (`@github/spark`, Spark Vite plugins, `spark.meta.json`, `runtime.config.json`).
- Vite dev/build pipeline.

### Fixed

- Spark error-boundary copy no longer refers to “this spark”.
