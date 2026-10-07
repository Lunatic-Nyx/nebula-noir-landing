-- =============================================================================
-- Nebula Noir — schema + baseline seed (ADDITIVE, IDEMPOTENT)
-- =============================================================================
-- This file used to be a destructive "reset" (drop + recreate). It is now
-- additive and idempotent:
--   * tables are created only when missing  (create table if not exists)
--   * missing columns are added             (alter table ... add column if not exists)
--   * indexes are created only when missing  (create index if not exists)
--   * functions are replaced                 (create or replace function)
--   * policies are dropped-if-exists + created
--   * base rows are seeded only when absent  (on conflict do nothing / not exists)
--
-- It NEVER drops a table and NEVER deletes application data. It is safe to run
-- repeatedly, on a live database, and automatically on every deployment
-- (see scripts/db-migrate.mjs and DEPLOYMENT.md). The historical file name is
-- kept for compatibility with existing docs and links.
--
-- It does not touch auth.users. Run it with a privileged (postgres/owner) role:
-- it creates a trigger on auth.users and public.is_admin() uses auth.uid().
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tables (fresh installs)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  label_en text not null default '',
  sort_order int not null default 0
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null,
  description text not null default '',
  notice text not null default '',
  alt text,
  r2_key text,
  public_url text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_info (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.api_secrets (
  key text primary key,
  value_encrypted text not null,
  updated_at timestamptz not null default now()
);

-- Deny-all RLS: only the SECURITY DEFINER function and service role touch this.
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text not null default '',
  city text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  description text not null default '',
  url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram_posts (
  id text primary key,
  caption text not null default '',
  media_type text not null default 'IMAGE',
  media_url text not null,
  permalink text not null,
  thumbnail_url text,
  timestamp timestamptz,
  synced_at timestamptz not null default now()
);

create table if not exists public.instagram_auth (
  id boolean primary key default true check (id),
  access_token text not null,
  user_id text,
  username text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Column convergence for databases created by older schema versions
-- (create table if not exists does not add columns to an existing table)
-- -----------------------------------------------------------------------------
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.categories add column if not exists slug text not null default '';
alter table public.categories add column if not exists label text not null default '';
alter table public.categories add column if not exists label_en text not null default '';
alter table public.categories add column if not exists sort_order int not null default 0;

alter table public.gallery_images add column if not exists category_id uuid;
alter table public.gallery_images add column if not exists title text not null default '';
alter table public.gallery_images add column if not exists description text not null default '';
alter table public.gallery_images add column if not exists notice text not null default '';
alter table public.gallery_images add column if not exists alt text;
alter table public.gallery_images add column if not exists r2_key text;
alter table public.gallery_images add column if not exists public_url text not null default '';
alter table public.gallery_images add column if not exists sort_order int not null default 0;
alter table public.gallery_images add column if not exists published boolean not null default true;
alter table public.gallery_images add column if not exists created_at timestamptz not null default now();

alter table public.contact_inquiries add column if not exists name text not null default '';
alter table public.contact_inquiries add column if not exists email text not null default '';
alter table public.contact_inquiries add column if not exists message text not null default '';
alter table public.contact_inquiries add column if not exists read boolean not null default false;
alter table public.contact_inquiries add column if not exists created_at timestamptz not null default now();

alter table public.brand_info add column if not exists key text not null default '';
alter table public.brand_info add column if not exists title text not null default '';
alter table public.brand_info add column if not exists body text not null default '';
alter table public.brand_info add column if not exists updated_at timestamptz not null default now();

alter table public.site_config add column if not exists value jsonb not null default '{}'::jsonb;
alter table public.site_config add column if not exists updated_at timestamptz not null default now();

alter table public.api_secrets add column if not exists value_encrypted text not null default '';
alter table public.api_secrets add column if not exists updated_at timestamptz not null default now();

alter table public.rate_limits add column if not exists count int not null default 0;
alter table public.rate_limits add column if not exists reset_at timestamptz not null default now();

alter table public.events add column if not exists title text not null default '';
alter table public.events add column if not exists venue text not null default '';
alter table public.events add column if not exists city text not null default '';
alter table public.events add column if not exists starts_at timestamptz;
alter table public.events add column if not exists ends_at timestamptz;
alter table public.events add column if not exists description text not null default '';
alter table public.events add column if not exists url text;
alter table public.events add column if not exists published boolean not null default true;
alter table public.events add column if not exists created_at timestamptz not null default now();

alter table public.instagram_posts add column if not exists caption text not null default '';
alter table public.instagram_posts add column if not exists media_type text not null default 'IMAGE';
alter table public.instagram_posts add column if not exists media_url text not null default '';
alter table public.instagram_posts add column if not exists permalink text not null default '';
alter table public.instagram_posts add column if not exists thumbnail_url text;
alter table public.instagram_posts add column if not exists timestamp timestamptz;
alter table public.instagram_posts add column if not exists synced_at timestamptz not null default now();

alter table public.instagram_auth add column if not exists user_id text;
alter table public.instagram_auth add column if not exists username text;
alter table public.instagram_auth add column if not exists expires_at timestamptz;
alter table public.instagram_auth add column if not exists updated_at timestamptz not null default now();
alter table public.instagram_auth add column if not exists access_token text not null default '';
-- allows the encrypted refresh token to blank the legacy column
alter table public.instagram_auth alter column access_token set default '';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists gallery_images_category_idx on public.gallery_images (category_id, sort_order);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);

-- Converge the natural-key uniqueness the runtime relies on
-- (admin brand_info.upsert(onConflict:'key') and the duplicate-slug guard).
-- Skipped when an index already exists or when duplicate values are present,
-- so a corrupt legacy table can never abort the deploy.
do $$
begin
  if not exists (select 1 from pg_class where relname = 'categories_slug_key' and relnamespace = 'public'::regnamespace and relkind = 'i') then
    if exists (select 1 from public.categories group by slug having count(*) > 1) then
      raise warning 'Nebula Noir: duplicate slug values in public.categories; unique index categories_slug_key not created';
    else
      create unique index categories_slug_key on public.categories (slug);
    end if;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_class where relname = 'brand_info_key_key' and relnamespace = 'public'::regnamespace and relkind = 'i') then
    if exists (select 1 from public.brand_info group by key having count(*) > 1) then
      raise warning 'Nebula Noir: duplicate key values in public.brand_info; unique index brand_info_key_key not created';
    else
      create unique index brand_info_key_key on public.brand_info (key);
    end if;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Row Level Security (idempotent: enabling twice is a no-op)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.gallery_images enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.brand_info enable row level security;
alter table public.events enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.instagram_auth enable row level security;
alter table public.site_config enable row level security;
alter table public.api_secrets enable row level security;
alter table public.rate_limits enable row level security;

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Atomic rate limiter. Keys are hashed identifiers supplied by the server.
create or replace function public.consume_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- Hard bounds so an abusive caller cannot poison buckets or flood the table.
  if p_key is null or length(p_key) = 0 or length(p_key) > 200
     or p_limit < 1 or p_limit > 1000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;

  -- Opportunistic cleanup of expired windows (bounded growth without a cron).
  if random() < 0.02 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;

  insert into public.rate_limits (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count = case
          when public.rate_limits.reset_at < now() then 1
          else public.rate_limits.count + 1
        end,
        reset_at = case
          when public.rate_limits.reset_at < now() then now() + make_interval(secs => p_window_seconds)
          else public.rate_limits.reset_at
        end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke execute on function public.consume_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Policies (drop-if-exists + create so re-runs are safe)
-- -----------------------------------------------------------------------------
-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- gallery
drop policy if exists "gallery_public_read_published" on public.gallery_images;
create policy "gallery_public_read_published"
  on public.gallery_images for select
  to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "gallery_admin_all" on public.gallery_images;
create policy "gallery_admin_all"
  on public.gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- contact
drop policy if exists "contact_anon_insert" on public.contact_inquiries;
create policy "contact_anon_insert"
  on public.contact_inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_admin_read" on public.contact_inquiries;
create policy "contact_admin_read"
  on public.contact_inquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contact_admin_update" on public.contact_inquiries;
create policy "contact_admin_update"
  on public.contact_inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_admin_delete" on public.contact_inquiries;
create policy "contact_admin_delete"
  on public.contact_inquiries for delete
  to authenticated
  using (public.is_admin());

-- brand_info
drop policy if exists "brand_info_public_read" on public.brand_info;
create policy "brand_info_public_read"
  on public.brand_info for select
  to anon, authenticated
  using (true);

drop policy if exists "brand_info_admin_all" on public.brand_info;
create policy "brand_info_admin_all"
  on public.brand_info for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- events
drop policy if exists "events_public_read_published" on public.events;
create policy "events_public_read_published"
  on public.events for select
  to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- instagram (writes via service role, which bypasses RLS)
drop policy if exists "instagram_public_read" on public.instagram_posts;
create policy "instagram_public_read"
  on public.instagram_posts for select
  to anon, authenticated
  using (true);

-- instagram_auth: no anon/auth policies; service role only

-- site_config: public read, admin write (never store secrets here)
drop policy if exists "site_config_public_read" on public.site_config;
create policy "site_config_public_read"
  on public.site_config for select
  to anon, authenticated
  using (true);

drop policy if exists "site_config_admin_all" on public.site_config;
create policy "site_config_admin_all"
  on public.site_config for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- api_secrets: admin only; runtime resolution uses the service role
drop policy if exists "api_secrets_admin_all" on public.api_secrets;
create policy "api_secrets_admin_all"
  on public.api_secrets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Baseline seed (one-time; only inserts missing rows; never overwrites edits)
--
-- Guarded by a `site_config` sentinel so a later deploy does NOT resurrect a
-- baseline row the operator deleted in Admin and does NOT duplicate a row they
-- renamed. To seed new baseline rows in a future change, bump the sentinel key
-- (e.g. `_schema_seed_v2`). Seeds use NOT EXISTS (not ON CONFLICT) so a legacy
-- table without a unique constraint on the natural key cannot abort the deploy.
-- -----------------------------------------------------------------------------
insert into public.categories (slug, label, label_en, sort_order)
select v.slug, v.label, v.label_en, v.sort_order
from (
  values
    ('chokers', 'Chokers', 'Chokers', 1),
    ('bracelets', 'Armbänder', 'Bracelets', 2),
    ('rings', 'Ringe', 'Rings', 3),
    ('earrings', 'Ohrringe', 'Earrings', 4),
    ('accessories', 'Accessoires', 'Accessories', 5)
) as v(slug, label, label_en, sort_order)
where not exists (select 1 from public.site_config where key = '_schema_seed_v1')
  and not exists (select 1 from public.categories c where c.slug = v.slug);

insert into public.brand_info (key, title, body)
select v.key, v.title, v.body
from (
  values
    ('mission', 'Mission', 'Lautes Statement für die schwarze Szene, Cosplay und Nerdkultur. Keine Massenware.'),
    ('identity', 'Identität', 'Cybergoth, Industrial, Cyberpunk, Dark Alternative. Neon auf Schwarz. Ketten, Nieten, große Ringe.'),
    ('craft', 'Handwerk', 'Kunstleder, PVC, schwere Metallketten, Nieten, große Ringe, fluoreszierendes Neon. Von Hand. Keine Serie.'),
    ('value_handwerk', 'Handwerk', 'Jedes Stück einzeln. Kunstleder, PVC, Ketten, Nieten, Neon – von uns verarbeitet.'),
    ('value_aesthetik', 'Look', 'Schwarz, Metall, fluoreszierendes Neon. Industrial, Clublicht, Subkultur.'),
    ('value_individualitaet', 'Statement', 'Laut tragen. Festivals, Clubs, Szene-Events.'),
    ('value_inklusivitaet', 'Szene', 'Schwarze Szene, Cosplay, Nerdkultur. Jeder Körper, jedes Geschlecht.'),
    ('quote', 'Zitat', 'Für Festivals, Clubnächte und Szene-Events.')
) as v(key, title, body)
where not exists (select 1 from public.site_config where key = '_schema_seed_v1')
  and not exists (select 1 from public.brand_info b where b.key = v.key);

-- Gallery: seed a demo row only on the first application and when no row with
-- the same title exists.
insert into public.gallery_images (title, description, public_url, category_id, sort_order)
select v.title, v.description, v.public_url, c.id, v.sort_order
from (
  values
    ('Void Serpent Choker', 'PVC-Choker, Kunstleder, schwere Kette, große Ringe.', '/demo/instagram/01.jpg', 'chokers', 1),
    ('Neon Resin Ring', 'PVC/Resin-Ring mit fluoreszierendem Neon.', '/demo/instagram/02.jpg', 'rings', 2),
    ('Chain Ring Earrings', 'Metallringe an Kette. Industrial-Hardware.', '/demo/instagram/03.jpg', 'earrings', 3),
    ('Rivet Chain Bracelet', 'Kette, Nieten, große Ringe. Kunstleder-Details.', '/demo/instagram/04.jpg', 'bracelets', 4),
    ('Cyber Hex Choker', 'Kunstleder/PVC-Choker, Neon-Hex, Metall-Hardware.', '/demo/instagram/05.jpg', 'chokers', 5),
    ('Neon Resin Bangle', 'Breiter PVC/Resin-Reif, fluoreszierendes Neon.', '/demo/instagram/06.jpg', 'bracelets', 6),
    ('Industrial Steel Ring', 'Schwerer Metallring, von Hand graviert.', '/demo/instagram/07.jpg', 'rings', 7),
    ('Neon Studs', 'Metallstecker, fluoreszierendes Neon.', '/demo/instagram/08.jpg', 'earrings', 8),
    ('Ring Chain Belt', 'Kettengürtel, große Ringe, Nieten.', '/demo/instagram/09.jpg', 'accessories', 9),
    ('Chain Collar', 'Kragen aus schweren Ketten und großen Ringen.', '/demo/instagram/10.jpg', 'chokers', 10),
    ('Black Resin Ring', 'Schwarzer PVC/Resin-Ring, Metallkern.', '/demo/instagram/07.jpg', 'rings', 11),
    ('Drop Chain Earrings', 'Lange Kettenohrringe, Ringe, Nieten.', '/demo/instagram/08.jpg', 'earrings', 12)
) as v(title, description, public_url, slug, sort_order)
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.site_config where key = '_schema_seed_v1')
  and not exists (select 1 from public.gallery_images g where g.title = v.title);

-- Events: seed only on the first application and only events that are not
-- already present (title + start).
insert into public.events (title, venue, city, starts_at, ends_at, description, url, published)
select v.title, v.venue, v.city, v.starts_at::timestamptz, v.ends_at::timestamptz, v.description, v.url, v.published
from (
  values
    (
      'Wave-Gotik-Treffen',
      'Agra-Messepark',
      'Leipzig',
      '2026-05-21 10:00:00+02',
      '2026-05-25 22:00:00+02',
      'Stand vor Ort. Aktuelle Stücke zum Anfassen.',
      'https://www.wave-gotik-treffen.de',
      true
    ),
    (
      'M''era Luna',
      'Flugplatz',
      'Hildesheim',
      '2026-08-08 10:00:00+02',
      '2026-08-09 23:00:00+02',
      'Festival-Stand. Kollektion und Custom-Beratung.',
      'https://www.meraluna.de',
      true
    ),
    (
      'LOYG Festival',
      'Bochumer Eventcenter, Rombacher Hütte 6–8',
      'Bochum',
      '2026-09-12 14:00:00+02',
      '2026-09-12 22:00:00+02',
      'Stand im Künstlerbereich. Let Out Your Geek: Nerdkultur, Cosplay, Gaming, Musik. Samstag 14–22 Uhr, letzter Einlass 20 Uhr. Aftershow 22:30–03:30 (ab 18).',
      'https://bochumer-eventcenter.de/',
      true
    )
) as v(title, venue, city, starts_at, ends_at, description, url, published)
where not exists (select 1 from public.site_config where key = '_schema_seed_v1')
  and not exists (
    select 1 from public.events e
    where e.title = v.title and e.starts_at = v.starts_at::timestamptz
  );

-- Sentinel: records that the one-time baseline seed has been applied. Do not
-- delete it unless you want the next deploy to re-seed deleted baseline rows.
insert into public.site_config (key, value)
values ('_schema_seed_v1', '{"version": 1}'::jsonb)
on conflict (key) do nothing;
