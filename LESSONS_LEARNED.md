# Lessons Learned

## Unused scaffold dependencies hide after a migration

After moving off GitHub Spark/Vite the lockfile kept a full shadcn/Radix + dashboard dependency set (recharts, react-hook-form, @tanstack/react-query, date-fns, embla-carousel-react, vaul, cmdk, uuid, zod, ...). None of it was imported by the live tree. Run `npx knip` after a big migration: it flags unused files, exports and dependencies. Removal is safe once `next build` passes — but keep dev tooling (`eslint*`, `typescript-eslint`, `globals`) even when knip flags it, and never touch the frozen CSS (`index.css`, `theme.css`, `art-deco-*`/`spark-theme-*`).

## Spark MIT is not this project's license

The template shipped an MIT file copyright GitHub, Inc. The live brand site is proprietary. Closing that license is a product decision; do not paste MIT back in. Third-party packages in `package.json` keep their own licenses.

## Idempotent schema beats a "reset" script

The old `supabase/reset.sql` dropped every public table and recreated it. That is fine as a one-time bootstrap but can never be automated: run on a live database it destroys operator data and — because it drops `profiles` — strips admin roles. Automating it was only safe after converting the file to **additive idempotency** (`create ... if not exists`, `create or replace`, `drop policy if exists` + `create`), and adding a one-time seed sentinel so a deploy cannot resurrect deleted rows or duplicate renamed ones. Rule: never wire a destructive SQL file into a build/deploy pipeline; make it convergent first, then automate. `npm run test:db` proves it by applying the real file twice against in-memory Postgres.

## Stale PRD and theme READMEs lie

Spark-era `PRD.md` still described cart, occult copy, and Cormorant Garamond. `THEME_INTEGRATION.md` pointed at `App.tsx`. Treat those files as living docs: they must match `AGENTS.md` and the App Router tree, or agents will rebuild the shop.

## Design freeze vs. product change

Removing cart/price is a product decision, not a restyle. Keep className strings on remaining nodes. Replace only the text/node that represented price or cart. Do not collapse surrounding flex rows.

## Never put `class="dark"` on `<html>`

`src/main.css` defines a `.dark` token set that differs from `src/index.css` `:root`. The live site does not use the dark-mode selector. ThemeProvider must not set `class="dark"` or `data-appearance="dark"`.

## Spark leftovers that look like branding

`spark-theme-*` classes are CSS namespaces from the theme kit. They are not the Spark SDK. Deleting them would change the look.

## Framer Motion + App Router

Motion components and `useScrollTrigger` require a client island. Keep the landing tree under `HomePage` (`'use client'`) so existing animation props stay untouched. Do not convert those sections to Server Components.

## Instagram: Login API vs Facebook Login

Use **Instagram API with Instagram Login** on `graph.instagram.com`. Facebook Login for Business needs a linked Page and `graph.facebook.com` — out of scope. Scope is only `instagram_business_basic` (read media). Do not add Messenger or publishing.

`GET /me` returns `user_id` (and sometimes `id`). Prefer `{user-id}/media` over `/me/media`.

VIDEO has `thumbnail_url`; CAROUSEL_ALBUM needs `children{media_url,media_type}`. Never upload `video/*` to R2 as a gallery still.

## Heading tracking vs. German compounds

Poiret One + `letter-spacing: 0.2em` + `word-wrap: break-word` splits `MASSANFERTIGUNGEN` after the last letter. Use `word-break: normal`, reduce tracking under 768px, and put `\n` in i18n titles with `whitespace-pre-line`.

## Inherited `overflow-wrap` loses to the global heading reset

`src/index.css` (frozen) sets `h1–h6 { overflow-wrap: normal }`. Adding `break-words` to a **wrapper** does nothing for the heading, because a declaration on the element beats an inherited value. To wrap long German legal compounds, either put the utility **directly on the heading element** (class specificity beats the `h*` type selector) or add a higher-specificity rule like `.legal-content h3 { overflow-wrap: break-word }` in the non-frozen `src/main.css`. Never edit the frozen stylesheet.

## `break-words` is a fallback, not a mobile layout fix

On the Contact H2, `break-words` alone split `MASSANFERTIGUNGEN` into `MASSANFERTIGUNGE` + `N`. Prefer responsive type: shrink the font/tracking at the base breakpoint (`text-2xl tracking-normal sm:text-3xl sm:tracking-[0.15em] …`) so the longest word actually fits, and keep `break-words` only as a last-resort guard for pathological widths.


## Viewport height: prefer `svh` with an explicit fallback

`min-h-screen` compiles to `100vh`, which is taller than the visible area on iOS Safari/Chrome Android (collapsing URL bar). Use `.nn-hero { min-height: 100vh }` plus `@supports (min-height: 100svh) { min-height: 100svh }`. Do not stack `min-h-screen min-h-[100svh]` — which wins depends on Tailwind's emission order, not the class order.

## Centralize repeated literals as SSOT

Repeated visual values drift when copy-pasted. Move them to `src/lib/design.ts` (image filter, toast chrome, scroll-offset var) and `src/lib/motion.ts` (`EASE_DECO`, the Art-Deco cubic-bezier that was duplicated 27×). Animation `duration`/`delay` values stay local — over-abstracting them hurts readability for no benefit.

## Verify before deleting risk: the dialog width cap

Dialog content must not use an uncapped `max-w-[calc(100vw-…)]`: on ultrawide screens it stretches edge-to-edge. Cap with a real max (`lg:max-w-6xl`). This is a visible layout change, so record it as a product decision.


## Hero video size vs Vercel body limit

Do not POST large MP4s through Next.js on Vercel (≈4.5MB). Presign a 120s R2 PUT and store the public URL in `brand_info.hero_video` (`title` = R2 key for later delete).

## Instagram scrape vs local demo

instagram.com blocks unauthenticated fetch. Demo media must be files in `public/demo/` (converted from HEIC in `Demo images/`). Live sync still uses Graph API.

## Inline `filter` vs Tailwind grayscale

`style={{ filter: 'contrast(...)' }}` on the same `img` as `filter grayscale` wins and kills hover. Put contrast/brightness on the wrapping `aspect-square` div; leave grayscale classes on the image.

## Intro screen vs App Router

The original SPA ran the loading screen once. `sessionStorage` skip made the intro disappear for the rest of the tab. Play it on every `/` mount; lock `html`/`body` overflow and stop Lenis via `nn-intro-lock` so the overlay cannot be scrolled away.

## Lenis

Use window-root Lenis with `autoRaf` and `respectReducedMotion`. Do not wrap the React tree in a way that remounts children. `prevent` dialogs/sheets. Skip `/admin` and `/login`. Native `scroll` + `getBoundingClientRect` still work because Lenis scrolls the window.

## Empty CMS vs fixtures

Fixtures are Demo Mode only. If Supabase is configured and `instagram_posts` / `gallery_images` are empty, show empty UI — do not paint Unsplash as live Instagram. Extra `SectionTransition` nodes must not render when the following section is empty, or the original About→Catalog divider doubles.

## Instagram CDN URLs expire

Graph `media_url` is short-lived. Sync must copy bytes to R2 (or re-sync often). Persist the R2 public URL on `instagram_posts.media_url`.

## Hero video scrubbing

`video.currentTime = progress * duration` needs frequent keyframes (0.5–1s). iOS requires `muted` + `playsInline`. If `readyState` is too low, skip scrub. `prefers-reduced-motion`: do not bind scroll.

## Tailwind 4 pipeline

Vite used `@tailwindcss/vite`. Next uses `@tailwindcss/postcss`. Do not rewrite `index.css` imports (`@import 'tailwindcss'`, `@config`). Only change the bundler plugin.

## Demo Mode is a first-class path

Local clones without secrets must still render. Every data function in `src/lib/data.ts` must branch on `isDemoMode()` before creating a Supabase client.

## SVG in Next

Vite returned a URL string for SVG imports. Prefer `/images/...` from `public/` for the logo so Turbopack and webpack stay consistent.

## Tailwind raw screens vs. container

`tailwind.config.js` defines `screens.coarse/fine/pwa` as `{ raw: "(pointer: coarse)" }`. Tailwind 4 may emit invalid `@media (width >= (pointer: coarse))` on `.container`. Do not “fix” those screen keys — they are part of the frozen theme config. The live layout does not rely on those container breakpoints.

## SVG length attributes reject CSS `calc()`

`<text x="calc(100vw - 80px)">` is invalid SVG. Browsers log `Expected length`. Measure `innerWidth`/`innerHeight` (or use percentages) and pass numbers.

## Radix DialogDescription

`DialogContent` without `DialogDescription` (or explicit `aria-describedby={undefined}`) warns on every open. Product dialogs need a visually hidden description. Sheets need `SheetTitle` + `SheetDescription`.

## Moon glyph orientation

Unicode `☾` opens sideways in most fonts. `spark-theme-moon-symbol` rotates it 90deg (open top, like a U). Do not put that class on the same node as a transform animation (`deco-scale-in`); wrap an inner span.

## Nav tracking vs. German labels

Poiret One + `tracking-[0.2em]` + five uppercase links overflows before `xl`. Shorten the last label and keep the hamburger until `xl`.

## RLS vs. contact form

Public INSERT on `contact_inquiries` without SELECT keeps spam readable only by admins. Do not enable anon SELECT.

## Never trust client-controlled auth headers

Vercel Cron can be authenticated with `Authorization: Bearer $CRON_SECRET`; Vercel sends it automatically when the env var is set. Treating any request that carries `x-vercel-cron` as authorized is an auth bypass — headers are client-controlled. Compare the bearer token in constant time and fail closed when the secret is unset.

## Delete external storage only after the DB write succeeds

For hero video replace/clear and gallery upload, write the database row first (or roll it back) and only then delete the old/just-uploaded R2 object. Reversing that order leaks orphan objects or destroys media on a failed DB write.

## Localize server actions from the locale cookie

Server actions and server components cannot use the client `useT()` hook. Keep one `translate()` helper and read `nn-locale` server-side (`src/i18n/server.ts`). Returning hardcoded German strings from actions re-introduces German toasts under English.

## Dead Spark-era kit is not branding

`spark-theme-*` class names stay; the unused kit slot components, `sparkTheme` registry, `ThemeDemo`, `theme.json`, and `.spark-initial-sha` do not. They contained removed cart/price/"Art Deco" copy and mislead agents. Delete dead kit files when unused rather than leaving them to be re-wired.

## `src/main.css` import order is load-bearing

`src/main.css` defines a light `:root`; the dark tokens live in `src/index.css`. The dark theme only wins because `app/layout.tsx` imports `index.css` after `main.css`. Do not "simplify" the duplicate imports without a visual diff — the page would flip to light.

## Upload/confirm keys are server-issued

`/api/gallery/upload` and `/api/hero/presign` generate the `{uuid}` key server-side. `confirmHeroVideo` must reject keys outside the `hero/` prefix and derive the public URL from `R2_PUBLIC_URL` instead of storing a client-supplied URL.

## `datetime-local` is wall-clock time — convert on the client

A `datetime-local` input yields `2026-05-21T10:00` without a zone. Parsing that on the server (Vercel = UTC) shifts every event by the offset. Convert to ISO in the browser (`new Date(value).toISOString()`) before calling the action, and `suppressHydrationWarning` on the rendered default value because server and browser timezones differ.

## `site_config` is public — code defaults are the safety net

`site_config` is anon-readable by design. Store only public content (`site`, `legal`, `translations`); secrets belong in `api_secrets` (AES-256-GCM, admin-only). Every reader must fall back to code defaults on empty/error/timeout, and an empty legal field must mean "use the default", never a blank page. Admin-authored legal HTML is sanitized on write as defense in depth.

## Admin-editable labels beat i18n keys

`resolveCategoryLabel` prefers DB labels over `messages.categories.*`, otherwise renaming "Ringe" in the admin would be a no-op while showing success. The i18n key remains only as the Demo/legacy fallback.

## `space-y-*` displaces absolutely positioned decorations

Tailwind's `space-y-*` sets both `margin-block-start` and `margin-block-end` on non-last children. An `absolute bottom-0` corner with a `space-y` parent gets pushed up by ~24px. Reset with `m-0!` on the decoration itself; padding-based offsets cannot fix it.

## Admin is German-only and server pages must not follow the public cookie

The admin layout nests `LocaleProvider initialLocale="de"`, but server components that call `getServerT()` still read `nn-locale` from the cookie. Use `getAdminT()` in admin pages and actions so headings/toasts stay German when a visitor has English selected. The public locale switch does not re-render admin server pages.

## Secret caches in serverless

`loadSecrets()` caches for 60s per instance. Invalidate on write (`invalidateSecretsCache()`), and remember a concurrent in-flight read can repopulate the cache with a stale snapshot; treat 60s staleness as the bound. `SECRETS_ENCRYPTION_KEY` loss makes stored values unreadable — env fallbacks are the escape hatch.

## Self-host brand fonts instead of gating Google Fonts

Loading Google Fonts behind a consent cookie meant every visitor without consent got system fonts, and the `'Poiret One', cursive` fallback rendered as **Comic Sans** on Windows. Even with consent, the cross-origin CSS → woff2 hop caused a fallback flash (the owner's FOUC report). Self-hosting the fonts in `public/fonts/` with `@font-face` (`src/styles/fonts.css`) and `<link rel="preload">` in `app/layout.tsx` removes the third-party request (no consent needed, so the banner is retired) and the FOUC in one move. Cinzel was dropped as unused. Always give display fonts a real fallback stack (`'Poiret One', 'Montserrat', sans-serif`), never the `cursive` generic.

## Legal templates need machine-checkable placeholders

Operator identity (name, address, VAT) cannot be invented. Mark required gaps as `[[…]]`, keep the defaults in `legal-content.ts`, and let the admin legal editor warn while any `[[` remains. Legal bases use the standard dual phrasing (Art. 6(1)(b) for contract-related, (f) otherwise); processor guarantees stay a bracketed operator confirmation until contracts exist.

## Unlayered CSS beats Tailwind utilities

`src/index.css` is frozen and its rules are unlayered, while Tailwind v4 emits utilities in `@layer utilities`. Unlayered declarations win regardless of specificity, so `.art-deco-divider { margin: 4rem 0 }` silently overrode `mx-auto` and left-aligned the divider. When a utility "does nothing" on a frozen class, use the important modifier (`mx-auto!`) instead of editing the frozen file.

## Equalize card heights with flex, not fixed sizes

Grid rows stretch to the tallest item; give the card `flex h-full flex-col`, the content `flex-1`, and the footer `mt-auto`. The wrapper `motion.div` needs `h-full` too, otherwise the card cannot fill the stretched grid cell. Do not set fixed pixel heights — long German titles would clip.




