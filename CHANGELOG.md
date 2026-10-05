# Changelog

All notable changes to this project are documented in reverse chronological order.

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
