# Deployment

**Last reviewed:** 2026-09-10 · Operator how-to after go-live: `USER_MANUAL.md`. Variable list: `.env.example`. License: proprietary (`LICENSE`).

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
2. SQL Editor → paste and run `supabase/reset.sql` (drops public tables in that script, then recreates).
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

Live DB already seeded? Do **not** re-run `reset.sql` (it drops tables). Instead update copy and add LOYG:

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

## 3. Cloudflare R2

1. R2 → Create bucket (e.g. `nebula-noir-gallery`).
2. Manage API tokens → S3-compatible access key.
3. Optional: custom domain or `r2.dev` public development URL → `R2_PUBLIC_URL` (no trailing slash).
4. Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
5. CORS (bucket settings) for the Vercel origin:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Gallery still images upload through the Next.js server. Hero video uses a short-lived R2 PUT presign, so CORS must allow PUT from the site origin. Public `R2_PUBLIC_URL` is used for `<img>` and `<video>`.

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

Cron/admin sync refreshes the long-lived token and stores it in `instagram_auth` (service role only). Env `INSTAGRAM_ACCESS_TOKEN` is the bootstrap if that table is empty. Re-run `reset.sql` (or add the `instagram_auth` table) if an older schema is already applied.

Existing databases: re-run `reset.sql` (or add the `contact_admin_delete` policy manually) so admins can delete contact inquiries — the new delete action in `/admin/inquiries` needs that RLS policy.

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
