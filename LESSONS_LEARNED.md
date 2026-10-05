# Lessons Learned

## Spark MIT is not this project's license

The template shipped an MIT file copyright GitHub, Inc. The live brand site is proprietary. Closing that license is a product decision; do not paste MIT back in. Third-party packages in `package.json` keep their own licenses.

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

