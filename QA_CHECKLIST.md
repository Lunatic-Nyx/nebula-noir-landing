# QA Checklist — Nebula Noir

Use this as a testable pass/fail list. Demo Mode means Supabase public keys are unset. Operator steps: `USER_MANUAL.md`.

**Last reviewed:** 2026-10-05

## UI parity (design freeze)

- [ ] Loading screen plays (~3.5s) on every visit to `/`, Poiret One wordmark, CRT overlay, logo glow.
- [ ] Body does not scroll under the intro overlay.
- [ ] Wheel scroll on public pages is smoothed (Lenis); `prefers-reduced-motion` is 1:1.
- [ ] Dialogs, sheets, and `/admin` `/login` are not Lenis-smoothed.
- [ ] Custom cursor glow follows the pointer; default cursor remains hidden.
- [ ] CRT scanline, Art Deco background canvases, and frame overlay still appear.
- [ ] Hero: logo size/glow, `NEBULA NOIR` heading, moon divider, subtitle, body copy, both CTAs — same classes and spacing as pre-migration.
- [ ] About: three value cards, Unsere Werte block, quote — same motion clip-path animations.
- [ ] Gallery grid, category filter buttons, card chrome (`spark-theme-card-wrapper`, corners, grayscale hover) unchanged aside from price/cart removal.
- [ ] Contact form: underline inputs, bordered textarea, full-width send button, ArtDeco corners.
- [ ] Footer four-column layout, tracking, hover transitions unchanged.
- [ ] Framer Motion timings on About/Catalog/Contact are not reduced.
- [ ] Fonts: Montserrat body, Poiret One headings.

## Gallery vs shop

- [ ] No cart icon in the nav.
- [ ] No checkout dialog.
- [ ] Product cards show category label instead of euro price; Details sits beside the category without overlap.
- [ ] Detail dialog has no “In den Warenkorb” / price; inquiry CTA uses the previous button classes.
- [ ] Category filters: Alle Stücke, Chokers, Armbänder, Ringe, Ohrringe, Accessoires.
- [ ] Nav: Anfragen (not Maßanfertigung); DE/EN does not overlap the last link.
- [ ] Crescent moons open at the top (U / half-moon), not left or right.
- [ ] Copy has no Art Deco, 1920s, occult, or mystical wording. Tagline is Cybergoth Industrial.
- [ ] Copy names Kunstleder, PVC, Ketten, Nieten, große Ringe, Neon. Audience is schwarze Szene / Cosplay / Nerdkultur.
- [ ] Events: LOYG Festival Bochum 12.09.2026 14–22 Uhr; past WGT / M’era Luna 2026 hidden on the landing page.
- [ ] Opening a product dialog does not log Missing Description.
- [ ] Loading screen does not log SVG `<text>` calc() length errors.

## Environment fallback (Demo Mode)

- [ ] With empty `.env.local`, site still renders.
- [ ] Gallery uses fixture images (`/demo/instagram/*.jpg` via `src/lib/products.ts` / fixtures).
- [ ] Events, brand copy, and Instagram fixtures render.
- [ ] Contact submit shows success or demo toast; no crash.
- [ ] Admin mutations show a demo/disabled toast; no R2 upload attempted.
- [ ] Hero without `NEXT_PUBLIC_HERO_VIDEO_URL` keeps the original SVG pattern background.

## Supabase / R2

- [ ] `supabase/reset.sql` creates tables, RLS, and seed categories/brand_info.
- [ ] Anon can SELECT published gallery/events/instagram/brand_info.
- [ ] Anon can INSERT `contact_inquiries` only (not SELECT others’ rows).
- [ ] Anon cannot INSERT/UPDATE gallery or events.
- [ ] Admin user with `profiles.role = 'admin'` can CRUD gallery metadata.
- [ ] Admin upload writes an object to R2 and a row with `public_url`.
- [ ] Rejected: non-image MIME, files over 10MB, unauthenticated upload.

## Instagram

- [ ] Cron `GET /api/cron/instagram` without `Authorization: Bearer $CRON_SECRET` returns 401.
- [ ] A cron request carrying only `x-vercel-cron` also returns 401 (header is not trusted).
- [ ] Sync talks to `graph.instagram.com` (Instagram Login), never `graph.facebook.com`.
- [ ] IMAGE, VIDEO (thumbnail), and CAROUSEL_ALBUM (first still) upsert into `instagram_posts`.
- [ ] Landing `#instagram` grid uses existing card language; permalinks open Instagram.
- [ ] Follow link `@nebula_noir.official` sits under the grid.
- [ ] Demo Mode / missing `INSTAGRAM_ACCESS_TOKEN` shows fixture posts, no Graph API call.
- [ ] Admin `/admin/instagram` sync requires admin; Demo Mode no-ops.
- [ ] Successful sync refreshes the long-lived token into `instagram_auth` when that table exists.
- [ ] With Supabase configured and empty `instagram_posts`, the Instagram section is hidden (no fixture fake-posts).
- [ ] Empty events list does not add a second divider between About and Gallery.
- [ ] Hash nav (`/#catalog`, `/#contact`) is not hidden under the fixed header.
- [ ] DE/EN toggle switches nav, hero, about, catalog, contact, footer, login, admin chrome (nav, headings, forms, toasts).
- [ ] Admin `/admin/inquiries` can delete an inquiry (needs the `contact_admin_delete` policy).
- [ ] Product detail dialog shows exactly one close control.
- [ ] Contact heading does not split `MASSANFERTIGUNGEN` mid-word on a 375px viewport.
- [ ] Favicon is the Nebula Noir logo.
- [ ] Demo Instagram/gallery images load from `/demo/instagram/*.jpg`.
- [ ] Without a hero video the Art Deco pattern remains (no `/hero.mp4`).
- [ ] Admin `/admin/hero` uploads MP4 via R2 presign; after save the landing hero scrubs on scroll.
- [ ] Demo Mode hero upload shows a disabled toast.
- [ ] Mobile menu closes after choosing a section.
- [ ] Contact submit while in-flight does not send twice.
- [ ] Gallery card hover still goes grayscale → color.

## Contact / info / legal / hero

- [ ] Contact rows appear in admin inquiries when Supabase is configured.
- [ ] Events section lists published upcoming stands; expired unpublished items hidden.
- [ ] About copy matches seed/fixtures until edited in admin.
- [ ] `/impressum`, `/datenschutz`, `/agb`, `/widerruf`, `/versand`, `/custom-orders`, `/ueber-uns` render with site chrome.
- [ ] Footer legal links navigate to those routes (no dialog).
- [ ] Hero video, when URL is set, sits behind existing content, muted, no player chrome.
- [ ] Scroll through hero scrubs `currentTime`; `prefers-reduced-motion` freezes on frame 0.

## Admin auth

- [ ] `/admin` unauthenticated → `/login`.
- [ ] Non-admin authenticated user → 403.
- [ ] Demo Mode `/admin` is reachable as read-only preview with banner.
- [ ] `LICENSE` is proprietary (not MIT / not GitHub, Inc.).
- [ ] `.env.example` lists site, Supabase, R2, Instagram, hero, and cron variables.
