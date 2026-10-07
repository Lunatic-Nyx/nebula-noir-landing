#!/usr/bin/env node
/**
 * Repeatable verification for supabase/reset.sql (dev only).
 *
 * Runs the real file against an in-memory Postgres (PGlite) with a minimal
 * Supabase `auth` stub, and proves:
 *   - a fresh apply creates the schema and the baseline seed;
 *   - a second apply is a no-op (idempotent) and preserves operator data;
 *   - the one-time seed sentinel does not resurrect deleted / rename-duplicate
 *     baseline rows on later applies;
 *   - an older schema converges (missing columns and tables get added).
 *
 * This is what backs the "safe to run on every deploy" claim. Run:
 *   npm run test:db
 *
 * PGlite lacks the full Supabase environment, so `auth.users`, `auth.uid()` and
 * the anon/authenticated/service_role roles are stubbed. This validates schema
 * logic and idempotency, not Supabase-specific JWT/RLS runtime behaviour.
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const here = dirname(fileURLToPath(import.meta.url))
const SQL = await readFile(resolve(here, '..', 'supabase', 'reset.sql'), 'utf8')

const AUTH_STUB = `
  create schema if not exists auth;
  create table if not exists auth.users (id uuid primary key);
  create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role; end if;
  end $$;
`

const LEGACY_SCHEMA = `
  create table public.profiles (id uuid primary key, role text not null default 'user');
  create table public.categories (id uuid primary key default gen_random_uuid(), slug text not null unique, label text not null);
  create table public.gallery_images (id uuid primary key default gen_random_uuid(), category_id uuid, title text not null, public_url text not null, sort_order int default 0);
  create table public.contact_inquiries (id uuid primary key default gen_random_uuid(), name text, email text, message text);
  create table public.brand_info (id uuid primary key default gen_random_uuid(), key text unique, title text, body text);
  create table public.events (id uuid primary key default gen_random_uuid(), title text, starts_at timestamptz);
  create table public.instagram_posts (id text primary key, media_url text, permalink text);
  create table public.instagram_auth (id boolean primary key default true, access_token text not null);
`

const fails = []
function check(label, condition, detail = '') {
  if (condition) console.log(`  ok  - ${label}`)
  else {
    console.error(`  FAIL - ${label} ${detail}`)
    fails.push(label)
  }
}

async function newDb() {
  const db = new PGlite({ extensions: { pgcrypto } })
  await db.exec(AUTH_STUB)
  return db
}

const count = async (db, table) =>
  Number((await db.query(`select count(*)::int as c from public.${table}`)).rows[0].c)

async function hasColumn(db, table, column) {
  const { rows } = await db.query(
    `select 1 from information_schema.columns
      where table_schema = 'public' and table_name = $1 and column_name = $2`,
    [table, column],
  )
  return rows.length === 1
}

async function hasTable(db, table) {
  const { rows } = await db.query(
    `select 1 from information_schema.tables
      where table_schema = 'public' and table_name = $1`,
    [table],
  )
  return rows.length === 1
}

async function hasIndex(db, name) {
  const { rows } = await db.query(
    `select 1 from pg_class where relname = $1 and relkind = 'i'`,
    [name],
  )
  return rows.length === 1
}

// 1. Fresh apply + idempotency + operator data + one-time seed sentinel.
{
  const db = await newDb()
  await db.exec(SQL)
  check(
    'fresh apply seeds baseline (5/8/12/3)',
    (await count(db, 'categories')) === 5 &&
      (await count(db, 'brand_info')) === 8 &&
      (await count(db, 'gallery_images')) === 12 &&
      (await count(db, 'events')) === 3,
  )

  const userId = '00000000-0000-0000-0000-000000000001'
  await db.exec(`insert into auth.users (id) values ('${userId}')`)
  await db.exec(
    `insert into public.contact_inquiries (name, email, message) values ('Marker', 'm@example.com', 'keep me')`,
  )
  await db.exec(`update public.profiles set role = 'admin' where id = '${userId}'`)

  await db.exec(SQL) // second apply

  check(
    'second apply keeps baseline counts stable',
    (await count(db, 'categories')) === 5 &&
      (await count(db, 'brand_info')) === 8 &&
      (await count(db, 'gallery_images')) === 12 &&
      (await count(db, 'events')) === 3,
  )
  check('operator inquiry survives', (await count(db, 'contact_inquiries')) === 1)
  const admin = await db.query(`select role from public.profiles where id = '${userId}'`)
  check('admin role survives', admin.rows[0]?.role === 'admin')
  check(
    'seed sentinel present',
    (await db.query(`select 1 from public.site_config where key = '_schema_seed_v1'`)).rows.length === 1,
  )

  // Deleted / renamed baseline rows must not come back on the next apply.
  await db.exec(`delete from public.gallery_images where title = 'Void Serpent Choker'`)
  await db.exec(`update public.gallery_images set title = 'Renamed Choker' where title = 'Chain Collar'`)
  await db.exec(SQL)
  check('deleted baseline row not resurrected', (await count(db, 'gallery_images')) === 11)
  check(
    'renamed baseline row not duplicated',
    (await db.query(`select 1 from public.gallery_images where title = 'Chain Collar'`)).rows.length === 0,
  )

  await db.close()
}

// 2. Convergence over an older schema.
{
  const db = await newDb()
  await db.exec(LEGACY_SCHEMA)
  await db.exec(SQL)

  check(
    'converges legacy columns',
    (await hasColumn(db, 'categories', 'label_en')) &&
      (await hasColumn(db, 'categories', 'sort_order')) &&
      (await hasColumn(db, 'gallery_images', 'alt')) &&
      (await hasColumn(db, 'gallery_images', 'r2_key')) &&
      (await hasColumn(db, 'gallery_images', 'notice')) &&
      (await hasColumn(db, 'events', 'venue')) &&
      (await hasColumn(db, 'events', 'published')) &&
      (await hasColumn(db, 'instagram_posts', 'caption')) &&
      (await hasColumn(db, 'instagram_auth', 'user_id')) &&
      (await hasColumn(db, 'profiles', 'created_at')),
  )
  check(
    'converges legacy tables',
    (await hasTable(db, 'site_config')) &&
      (await hasTable(db, 'api_secrets')) &&
      (await hasTable(db, 'rate_limits')),
  )
  check('legacy database gets baseline seed', (await count(db, 'categories')) === 5)

  await db.close()
}

// 3. Legacy schema WITHOUT unique constraints on the seed natural keys.
//    Seeds use NOT EXISTS (not ON CONFLICT), so this must apply cleanly and
//    must not abort (previously a unique-index creation could fail here).
{
  const db = await newDb()
  await db.exec(`
    create table public.categories (id uuid primary key default gen_random_uuid(), slug text not null, label text not null);
    create table public.brand_info (id uuid primary key default gen_random_uuid(), key text not null, title text, body text);
    insert into public.categories (slug, label) values ('rings', 'Operator Ringe');
    insert into public.brand_info (key, title, body) values ('mission', 'Mission', 'Operator-Text');
  `)
  await db.exec(SQL)
  check(
    'constraint-less legacy schema applies and seeds missing rows',
    (await count(db, 'categories')) === 5 && (await count(db, 'brand_info')) === 8,
  )
  const ring = await db.query(`select label from public.categories where slug = 'rings'`)
  check('legacy constraint-less row preserved', ring.rows[0]?.label === 'Operator Ringe')
  const mission = await db.query(`select body from public.brand_info where key = 'mission'`)
  check('legacy brand_info row preserved', mission.rows[0]?.body === 'Operator-Text')
  check(
    'seed sentinel present',
    (await db.query(`select 1 from public.site_config where key = '_schema_seed_v1'`)).rows.length === 1,
  )
  check(
    'constraint convergence creates unique indexes on clean legacy',
    (await hasIndex(db, 'categories_slug_key')) && (await hasIndex(db, 'brand_info_key_key')),
  )

  // Idempotent on this shape too.
  await db.exec(SQL)
  check(
    'constraint-less legacy schema re-apply stable',
    (await count(db, 'categories')) === 5 && (await count(db, 'brand_info')) === 8,
  )

  await db.close()
}

// 4. Constraint-less legacy schema with DUPLICATE natural keys.
//    Removing the `create unique index ... categories_slug_key` /
//    `brand_info_key_key` statements fixed the deploy-abort for this shape.
//    Seeds use NOT EXISTS, so duplicate-heavy legacy data must apply cleanly
//    and stay idempotent.
{
  const db = await newDb()
  await db.exec(`
    create table public.categories (id uuid primary key default gen_random_uuid(), slug text not null, label text not null);
    create table public.brand_info (id uuid primary key default gen_random_uuid(), key text not null, title text, body text);
    insert into public.categories (slug, label) values ('rings', 'Operator Ringe A'), ('rings', 'Operator Ringe B');
    insert into public.brand_info (key, title, body) values ('mission', 'Mission A', 'Text A'), ('mission', 'Mission B', 'Text B');
  `)
  await db.exec(SQL)
  check(
    'duplicate-key constraint-less legacy applies and seeds missing rows',
    (await count(db, 'categories')) === 6 && (await count(db, 'brand_info')) === 9,
  )
  check(
    'duplicate legacy rows preserved',
    Number((await db.query(`select count(*)::int as c from public.categories where slug = 'rings'`)).rows[0].c) === 2 &&
      Number((await db.query(`select count(*)::int as c from public.brand_info where key = 'mission'`)).rows[0].c) === 2,
  )
  check(
    'seed sentinel present after duplicate-key apply',
    (await db.query(`select 1 from public.site_config where key = '_schema_seed_v1'`)).rows.length === 1,
  )
  check(
    'duplicate legacy values skip unique-index creation without abort',
    !(await hasIndex(db, 'categories_slug_key')) && !(await hasIndex(db, 'brand_info_key_key')),
  )
  await db.exec(SQL)
  check(
    'duplicate-key constraint-less legacy re-apply stable',
    (await count(db, 'categories')) === 6 && (await count(db, 'brand_info')) === 9,
  )
  await db.close()
}

if (fails.length > 0) {
  console.error(`\n${fails.length} schema check(s) failed`)
  process.exit(1)
}
console.log('\nschema verification passed')
