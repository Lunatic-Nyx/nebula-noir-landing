-- Nebula Noir schema reset. Run in Supabase SQL editor.
-- Drops and recreates public app tables. Does not drop auth.users.

create extension if not exists "pgcrypto";

drop table if exists public.gallery_images cascade;
drop table if exists public.categories cascade;
drop table if exists public.contact_inquiries cascade;
drop table if exists public.brand_info cascade;
drop table if exists public.events cascade;
drop table if exists public.instagram_posts cascade;
drop table if exists public.instagram_auth cascade;
drop table if exists public.site_config cascade;
drop table if exists public.api_secrets cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  label_en text not null default '',
  sort_order int not null default 0
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null,
  description text not null default '',
  alt text,
  r2_key text,
  public_url text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.brand_info (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table public.site_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.api_secrets (
  key text primary key,
  value_encrypted text not null,
  updated_at timestamptz not null default now()
);

create table public.events (
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

create table public.instagram_posts (
  id text primary key,
  caption text not null default '',
  media_type text not null default 'IMAGE',
  media_url text not null,
  permalink text not null,
  thumbnail_url text,
  timestamp timestamptz,
  synced_at timestamptz not null default now()
);

create table public.instagram_auth (
  id boolean primary key default true check (id),
  access_token text not null,
  user_id text,
  username text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create index gallery_images_category_idx on public.gallery_images (category_id, sort_order);
create index events_starts_at_idx on public.events (starts_at);
create index contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);

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

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- categories
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "categories_admin_all"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- gallery
create policy "gallery_public_read_published"
  on public.gallery_images for select
  to anon, authenticated
  using (published = true or public.is_admin());

create policy "gallery_admin_all"
  on public.gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- contact
create policy "contact_anon_insert"
  on public.contact_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "contact_admin_read"
  on public.contact_inquiries for select
  to authenticated
  using (public.is_admin());

create policy "contact_admin_update"
  on public.contact_inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_admin_delete"
  on public.contact_inquiries for delete
  to authenticated
  using (public.is_admin());

-- brand_info
create policy "brand_info_public_read"
  on public.brand_info for select
  to anon, authenticated
  using (true);

create policy "brand_info_admin_all"
  on public.brand_info for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- events
create policy "events_public_read_published"
  on public.events for select
  to anon, authenticated
  using (published = true or public.is_admin());

create policy "events_admin_all"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- instagram (writes via service role, which bypasses RLS)
create policy "instagram_public_read"
  on public.instagram_posts for select
  to anon, authenticated
  using (true);

-- instagram_auth: no anon/auth policies; service role only

-- site_config: public read, admin write (never store secrets here)
create policy "site_config_public_read"
  on public.site_config for select
  to anon, authenticated
  using (true);

create policy "site_config_admin_all"
  on public.site_config for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- api_secrets: admin only; runtime resolution uses the service role
create policy "api_secrets_admin_all"
  on public.api_secrets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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

insert into public.categories (slug, label, label_en, sort_order) values
  ('chokers', 'Chokers', 'Chokers', 1),
  ('bracelets', 'Armbänder', 'Bracelets', 2),
  ('rings', 'Ringe', 'Rings', 3),
  ('earrings', 'Ohrringe', 'Earrings', 4),
  ('accessories', 'Accessoires', 'Accessories', 5);

insert into public.brand_info (key, title, body) values
  ('mission', 'Mission', 'Lautes Statement für die schwarze Szene, Cosplay und Nerdkultur. Keine Massenware.'),
  ('identity', 'Identität', 'Cybergoth, Industrial, Cyberpunk, Dark Alternative. Neon auf Schwarz. Ketten, Nieten, große Ringe.'),
  ('craft', 'Handwerk', 'Kunstleder, PVC, schwere Metallketten, Nieten, große Ringe, fluoreszierendes Neon. Von Hand. Keine Serie.'),
  ('value_handwerk', 'Handwerk', 'Jedes Stück einzeln. Kunstleder, PVC, Ketten, Nieten, Neon – von uns verarbeitet.'),
  ('value_aesthetik', 'Look', 'Schwarz, Metall, fluoreszierendes Neon. Industrial, Clublicht, Subkultur.'),
  ('value_individualitaet', 'Statement', 'Laut tragen. Festivals, Clubs, Szene-Events.'),
  ('value_inklusivitaet', 'Szene', 'Schwarze Szene, Cosplay, Nerdkultur. Jeder Körper, jedes Geschlecht.'),
  ('quote', 'Zitat', 'Für Festivals, Clubnächte und Szene-Events.');

insert into public.gallery_images (title, description, public_url, category_id, sort_order)
select v.title, v.description, v.public_url, c.id, v.sort_order
from (
  values
    ('Void Serpent Choker', 'PVC-Choker, Kunstleder, schwere Kette, große Ringe.', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', 'chokers', 1),
    ('Neon Resin Ring', 'PVC/Resin-Ring mit fluoreszierendem Neon.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', 'rings', 2),
    ('Chain Ring Earrings', 'Metallringe an Kette. Industrial-Hardware.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', 'earrings', 3),
    ('Rivet Chain Bracelet', 'Kette, Nieten, große Ringe. Kunstleder-Details.', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', 'bracelets', 4),
    ('Cyber Hex Choker', 'Kunstleder/PVC-Choker, Neon-Hex, Metall-Hardware.', 'https://images.unsplash.com/photo-1610217438102-c550ab935b72?w=800&q=80', 'chokers', 5),
    ('Neon Resin Bangle', 'Breiter PVC/Resin-Reif, fluoreszierendes Neon.', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80', 'bracelets', 6),
    ('Industrial Steel Ring', 'Schwerer Metallring, von Hand graviert.', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80', 'rings', 7),
    ('Neon Studs', 'Metallstecker, fluoreszierendes Neon.', 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80', 'earrings', 8),
    ('Ring Chain Belt', 'Kettengürtel, große Ringe, Nieten.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', 'accessories', 9),
    ('Chain Collar', 'Kragen aus schweren Ketten und großen Ringen.', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80', 'chokers', 10),
    ('Black Resin Ring', 'Schwarzer PVC/Resin-Ring, Metallkern.', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', 'rings', 11),
    ('Drop Chain Earrings', 'Lange Kettenohrringe, Ringe, Nieten.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', 'earrings', 12)
) as v(title, description, public_url, slug, sort_order)
join public.categories c on c.slug = v.slug;

insert into public.events (title, venue, city, starts_at, ends_at, description, url, published) values
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
  );
