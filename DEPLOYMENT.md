# Deployment

**Last reviewed:** 2026-10-07 · Operator how-to after go-live: `USER_MANUAL.md`. Variable list: `.env.example`. License: proprietary (`LICENSE`).

## 1. Vercel (Next.js)

1. Push this repo to GitHub.
2. New Vercel project → Framework Preset: Next.js.
3. Set environment variables from `.env.example`. Empty Supabase public keys force Demo Mode — do not ship production that way.
4. Deploy. Output: default Next.js (no `dist`). Private repo recommended (proprietary source).

Local:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Demo Mode: skip filling Supabase/R2 keys; `npm run dev` still serves the landing page.

## 2. Supabase

1. Create a project.
2. Apply the schema — either let the deploy do it (recommended) or run it once manually:
   - **Automatic:** set `SUPABASE_DB_URL` (see "Automatic schema apply on every deployment" below). Every deploy then applies `supabase/reset.sql`.
   - **Manual:** Supabase SQL Editor → paste and run `supabase/reset.sql` (additive, idempotent), or locally `npm run db:migrate`.
3. Authentication → enable Email provider.
4. Create the first admin:

```sql
-- After the user signs up (or invite via Dashboard):
insert into public.profiles (id, role)
values ('<auth.users uuid>', 'admin')
on conflict (id) do update set role = 'admin';
```

5. Copy Project URL and anon key into `NEXT_PUBLIC_SUPABASE_*`.
6. Copy service role key into `SUPABASE_SERVICE_ROLE_KEY` (Vercel encrypted env).

Live DB already seeded? `reset.sql` is additive: it seeds a row only when it is missing and never overwrites operator edits. To change existing copy and add LOYG, use the statements below (they are safe to re-run):

```sql
update public.brand_info set title = 'Mission', body = 'Lautes Statement für die schwarze Szene, Cosplay und Nerdkultur. Keine Massenware.' where key = 'mission';
update public.brand_info set title = 'Identität', body = 'Cybergoth, Industrial, Cyberpunk, Dark Alternative. Neon auf Schwarz. Ketten, Nieten, große Ringe.' where key = 'identity';
update public.brand_info set title = 'Handwerk', body = 'Kunstleder, PVC, schwere Metallketten, Nieten, große Ringe, fluoreszierendes Neon. Von Hand. Keine Serie.' where key = 'craft';
update public.brand_info set title = 'Handwerk', body = 'Jedes Stück einzeln. Kunstleder, PVC, Ketten, Nieten, Neon – von uns verarbeitet.' where key = 'value_handwerk';
update public.brand_info set title = 'Look', body = 'Schwarz, Metall, fluoreszierendes Neon. Industrial, Clublicht, Subkultur.' where key = 'value_aesthetik';
update public.brand_info set title = 'Statement', body = 'Laut tragen. Festivals, Clubs, Szene-Events.' where key = 'value_individualitaet';
update public.brand_info set title = 'Szene', body = 'Schwarze Szene, Cosplay, Nerdkultur. Jeder Körper, jedes Geschlecht.' where key = 'value_inklusivitaet';
update public.brand_info set title = 'Zitat', body = 'Für Festivals, Clubnächte und Szene-Events.' where key = 'quote';

insert into public.events (title, venue, city, starts_at, ends_at, description, url, published)
select
  'LOYG Festival',
  'Bochumer Eventcenter, Rombacher Hütte 6–8',
  'Bochum',
  '2026-09-12 14:00:00+02',
  '2026-09-12 22:00:00+02',
  'Stand im Künstlerbereich. Let Out Your Geek: Popkultur, Cosplay, Gaming und Musik. Samstag 14–22 Uhr, letzter Einlass 20 Uhr. Aftershow 22:30–03:30 (ab 18).',
  'https://bochumer-eventcenter.de/',
  true
where not exists (
  select 1 from public.events where title = 'LOYG Festival' and starts_at = '2026-09-12 14:00:00+02'
);
```

### Automatic schema apply on every deployment

`supabase/reset.sql` is **additive and idempotent**: it creates missing tables/columns/indexes, replaces functions, (re)creates policies, and seeds missing baseline rows once. It never drops a table and never deletes application data, so it is safe to run on every deployment and on a live database. It supersedes the manual "upgrade an existing database" block that used to live here.

`vercel.json` runs it before the build:

```json
"buildCommand": "node scripts/db-migrate.mjs && next build"
```

Setup:

1. Use the Supabase **Session pooler** connection string (IPv4). **Do not use the Direct connection** (`db.<ref>.supabase.co:5432`): it is IPv6-only and will NOT connect from a Vercel build.
2. If the Vercel **Supabase integration** exports a pooler URL (`POSTGRES_URL` / `POSTGRES_URL_NON_POOLING`), the runner uses it automatically. Otherwise — or if the integration's URL is the IPv6 direct one — set **`SUPABASE_DB_URL`** in Vercel (Production scope, encrypted) to the session-pooler string:
   `postgresql://postgres.<ref>:<URL-ENCODED-PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
   Never prefix `NEXT_PUBLIC_`.
3. Deploy. `scripts/db-migrate.mjs` connects (trying each configured URL until one succeeds), applies the file in one transaction with a cross-deploy advisory lock, then runs `next build`.

Behavior:

- Scope the DB URL to **Production only.** Preview and Development builds skip the apply even if a URL is present, so a branch build cannot mutate the production database.
- **Best effort by default:** if no Postgres URL is configured, or it cannot connect, the runner logs a warning and the deployment continues. Set `DB_MIGRATE_REQUIRED=1` to fail the build instead — recommended on the project that owns the schema.
- Candidate order: `SUPABASE_DB_URL` → `POSTGRES_URL_NON_POOLING` → `POSTGRES_URL` → `DATABASE_URL` → `POSTGRES_PRISMA_URL`. The first that connects wins (the integration's direct URL is IPv6-only on many projects, so a pooler fallback matters).
- Apply error → the transaction rolls back; the runner warns and continues (or fails with `DB_MIGRATE_REQUIRED=1`), so a half-applied schema is never left behind.
- `DB_MIGRATE_SKIP=1` → emergency bypass (e.g. the database is briefly unreachable and you must ship anyway). `DB_MIGRATE_ALLOW_PREVIEW=1` opts a non-production build into applying.
- Manual apply anywhere: `npm run db:migrate` (reads `.env.local` when present, otherwise the shell env).
- Keep TLS on: use Supabase's `?sslmode=require`. The runner refuses `sslmode=disable`, `sslmode=no-verify` and `uselibpqcompat` for a remote host. Never disable certificate/TLS verification for the production database.
- The runner relies on Vercel's `VERCEL_ENV` system variable (exposed by default) to tell production from preview. If it is missing, the runner warns and skips (it fails only with `DB_MIGRATE_REQUIRED=1`).
- The baseline seed is **one-time** (guarded by the `site_config` key `_schema_seed_v1`): after the first apply, deploys no longer re-insert baseline rows the operator deleted or duplicated rows they renamed. To seed new baseline rows in a future change, bump the sentinel key in `supabase/reset.sql`.
- Keep `supabase/reset.sql` as the single source of truth; do not add schema DDL elsewhere.
- Verify the SQL and its idempotency locally with `npm run test:db` (in-memory Postgres, no Supabase project needed). This is what backs the "safe on every deploy" claim.

Set `SECRETS_ENCRYPTION_KEY` (64 hex chars) to enable the Admin → API-Keys editor:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Smoke test after deploy: `/admin` (dashboard), `/admin/content` (save a translation), `/admin/categories` (create + delete a test category), `/admin/secrets` (save/clear with the key set), `/admin/health` (all checks green), and the public legal pages.

Gallery seed: `reset.sql` seeds local `/demo/instagram/*.jpg` paths (no third-party image host). Existing installs that still point at `images.unsplash.com` should replace those rows in Admin → Galerie so the privacy policy stays accurate.

## 3. Cloudflare R2

1. R2 → Create bucket (e.g. `nebula-noir-gallery`).
2. Manage API tokens → S3-compatible access key.
3. Optional: custom domain or `r2.dev` public development URL → `R2_PUBLIC_URL` (no trailing slash).
4. Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (S3 API host, not the public `r2.dev` URL). No trailing slash. Trim whitespace in Vercel values.
5. `getR2Client()` sets AWS SDK checksums to `WHEN_REQUIRED`. SDK ≥3.729 otherwise signs CRC32, which R2 rejects as SignatureDoesNotMatch.
6. CORS (bucket settings) for the site origins:

```json
[
  {
    "AllowedOrigins": [
      "https://nebula-noir.com",
      "https://www.nebula-noir.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Why exactly this:

- **PUT** is required for the hero video and gallery images: the browser uploads straight to `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` with a short-lived presigned URL, so the bucket must answer the CORS preflight for `PUT` from `https://nebula-noir.com` (and `www` if used).
- **`AllowedHeaders: ["*"]`** (or at least `["content-type"]`): the presign binds the content type, and the browser sends it on the PUT; a missing header in the policy makes the preflight fail. `ETag` is exposed so any future multipart/complete flow can read it.
- **GET/HEAD** are optional for plain `<img>`/`<video>` display (they do not send an `Origin`), but keep them so images can be fetched/processed via JavaScript later.
- **Gallery images use the same browser PUT** as the hero video (`POST /api/gallery/presign`, then PUT, then `POST /api/gallery/upload` to store the row). The signed URL includes the file size. A missing CORS rule shows `blocked by CORS policy` in the browser console.
- **Vercel previews** (optional): add `"https://*.vercel.app"` if you want to upload the hero video from preview deployments. It allows any Vercel subdomain, but the route still requires an admin session.
- Custom public domain for `R2_PUBLIC_URL` (e.g. `media.nebula-noir.com`) serves plain media without CORS; no extra origin is needed for display.

After saving the policy, verify from the production origin: Admin → Hero-Video upload must complete; a missing rule shows `blocked by CORS policy` / no `Access-Control-Allow-Origin` in the browser console.

## 4. Instagram (`@nebula_noir.official`) — Instagram Login only

We use the **Instagram API with Instagram Login** (`graph.instagram.com`). No Facebook Page, no Facebook Login, no Messenger, no publishing.

Account must be Instagram **Business** or **Creator** (Professional).

### Meta app

1. [Meta for Developers](https://developers.facebook.com/) → create an app → add product **Instagram**.
2. Use **Instagram API with Instagram Login** (not Facebook Login for Business).
3. Valid OAuth redirect URI (Graph Explorer / app settings), e.g. `https://localhost/` for token generation.
4. Permission / scope: **`instagram_business_basic`** (profile + media read).

### Long-lived token

1. In Graph API Explorer, switch to the Instagram app, generate a user token with `instagram_business_basic`.
2. Short-lived token (~1h) → long-lived (~60 days):

```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={INSTAGRAM_APP_SECRET}
  &access_token={SHORT_LIVED_TOKEN}
```

3. Optional user id:

```
GET https://graph.instagram.com/v22.0/me?fields=user_id,username,account_type&access_token={LONG_LIVED_TOKEN}
```

4. Env:

- `INSTAGRAM_ACCESS_TOKEN` — required (long-lived)
- `INSTAGRAM_USER_ID` — optional (`/me` fills it)
- `INSTAGRAM_APP_ID` — optional Meta dashboard id; not read at runtime
- `INSTAGRAM_APP_SECRET` — only for the exchange above, not needed at runtime
- `INSTAGRAM_GRAPH_VERSION` — default `v22.0`

Do **not** put the token in `NEXT_PUBLIC_*`.

### Sync

- Daily: Vercel Cron `GET /api/cron/instagram` (`vercel.json`). The route accepts only `Authorization: Bearer $CRON_SECRET`; Vercel sends that header automatically when `CRON_SECRET` is set. Missing/mismatched secret → 401.
- Manual: `/admin/instagram` or `POST /api/instagram/sync` (admin session).
- Still images are copied to R2 when R2 is configured (CDN URLs expire). Videos/carousels use thumbnail or first image.
- Demo Mode (no Supabase public keys): fixture posts. Live Supabase with empty `instagram_posts`: section hidden (no Unsplash fake-feed).
- Without `INSTAGRAM_ACCESS_TOKEN`, cron/admin sync does not call Graph.

Cron/admin sync refreshes the long-lived token and stores it in `instagram_auth` (service role only). Env `INSTAGRAM_ACCESS_TOKEN` is the bootstrap if that table is empty. The deploy-time apply creates `instagram_auth` on older schemas.

Existing databases: the deploy-time apply (or `npm run db:migrate`) adds the `contact_admin_delete` policy so admins can delete contact inquiries — the delete action in `/admin/inquiries` needs that RLS policy.

Signup creates `profiles` with role `user` via trigger. Promote the operator:

```sql
update public.profiles set role = 'admin' where id = '<auth.users uuid>';
```

## 4b. Contact form email (Resend)

The contact form always stores the inquiry in Supabase. To also get a notification email:

1. Create an API key in Resend and set `RESEND` (server-only, never `NEXT_PUBLIC_`).
2. Verify the sending domain in Resend and set `CONTACT_FROM_EMAIL` to a verified sender (default `contact@nebula-noir.com`).
3. Optionally set `CONTACT_TO_EMAIL` for the recipient (default `contact@nebula-noir.com`).

Email is best-effort: a Resend error or timeout is logged and does not fail the form; the inquiry remains visible under `/admin/inquiries`.

## 5. Hero video
Upload in **Admin → Hero-Video** (`/admin/hero`). The file goes to R2 via presigned PUT; the public URL is stored in `brand_info` key `hero_video`.

1. Encode H.264 + AAC, `faststart`, keyframes every 0.5–1s (for scrub).
2. MP4 / WebM / MOV, max 80MB.
3. Optional override: `NEXT_PUBLIC_HERO_VIDEO_URL`.
4. Without a video the original Art Deco pattern remains. `prefers-reduced-motion` freezes on frame 0.

## 6. Post-deploy smoke

Follow `QA_CHECKLIST.md`: Demo Mode locally, then production with secrets. Walk the operator paths in `USER_MANUAL.md` (login, gallery upload, event, inquiry, IG sync, hero).
