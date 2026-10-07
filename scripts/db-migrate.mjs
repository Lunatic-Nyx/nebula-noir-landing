#!/usr/bin/env node
/**
 * Applies supabase/reset.sql to the Supabase Postgres database.
 *
 * supabase/reset.sql is additive and idempotent (it never drops tables or
 * deletes application data), so this runner is safe to call on every
 * deployment. It is wired into the Vercel build via vercel.json ("buildCommand").
 *
 * Guarantees:
 * - Runs the whole file inside one transaction and rolls back on error. A
 *   cross-deploy advisory lock serializes concurrent builds.
 * - Never logs the connection string or its password.
 * - Best effort by default: if no Postgres URL is configured or the database is
 *   unreachable, it logs a warning and lets the deployment continue, so schema
 *   plumbing can never take the site down. Set DB_MIGRATE_REQUIRED=1 to make
 *   any failure fail the build instead.
 * - Production only: a Preview/Development build skips unless explicitly allowed.
 * - Refuses `sslmode=disable`/`sslmode=no-verify`/`uselibpqcompat` for a remote host.
 *
 * Env (a Postgres connection string is needed; first match wins, then each is
 * tried until one connects):
 *   SUPABASE_DB_URL              Explicit override. Use the Supabase **Session
 *                                pooler** (IPv4). The **Direct connection** is
 *                                IPv6-only and will NOT connect from Vercel:
 *                                postgresql://postgres.<ref>:<URL-ENCODED-PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
 *   POSTGRES_URL_NON_POOLING     Set by the Vercel Supabase integration (direct;
 *                                may be IPv6-only).
 *   POSTGRES_URL                 Set by the Vercel Supabase integration (pooler).
 *   DATABASE_URL / POSTGRES_PRISMA_URL  Common aliases.
 *   DB_MIGRATE_REQUIRED=1        Fail the build if the apply cannot run/succeed.
 *   DB_MIGRATE_SKIP=1            Emergency bypass.
 *   DB_MIGRATE_ALLOW_PREVIEW=1   Allow the apply on a non-production Vercel build.
 *
 * Note: the integration's API keys (NEXT_PUBLIC_SUPABASE_*, *_SERVICE_ROLE_KEY)
 * talk to PostgREST over HTTPS and cannot run DDL, so a real Postgres URL is
 * required. If the integration exports a pooler URL it is used automatically;
 * otherwise set SUPABASE_DB_URL to the Session pooler string.
 *
 * Manual use: npm run db:migrate  (reads .env.local when present)
 */
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const SQL_PATH = resolve(ROOT, 'supabase', 'reset.sql')

// Identifies this app's schema-apply lock. Any constant works; it only needs to
// be stable so two deployments cannot apply DDL at the same time.
const ADVISORY_LOCK_KEY = 80219001

// Postgres connection strings, in preference order. The first that is set is
// used; if it cannot connect the next is tried. This lets the Vercel Supabase
// integration work without a manual variable, while SUPABASE_DB_URL stays the
// explicit session-pooler override.
const DB_URL_CANDIDATES = [
  'SUPABASE_DB_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL',
  'DATABASE_URL',
  'POSTGRES_PRISMA_URL',
]

function resolveDbUrls() {
  const found = []
  for (const name of DB_URL_CANDIDATES) {
    const value = (process.env[name] ?? '').trim()
    if (value) found.push({ name, url: value })
  }
  return found
}

/**
 * Minimal `.env.local` reader for manual/local runs. `next dev`/`next build`
 * load this file themselves; a plain `node` process does not. Existing
 * process env always wins. On Vercel the file is absent, so this is a no-op.
 */
function loadEnvLocal() {
  const path = resolve(ROOT, '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line)
    if (!match || line.trimStart().startsWith('#')) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    const quoted =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    process.env[key] = quoted ? rawValue.slice(1, -1) : rawValue
  }
}

function redact(value) {
  const text = value instanceof Error ? value.message : String(value)
  return text.replace(
    /((?:postgres(?:ql)?):\/\/[^:@\s/]+:)[^@\s/]+(@)/gi,
    '$1***$2',
  )
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function needsForcedSsl(url) {
  if (/[?&]sslmode=/i.test(url)) return false
  const host = hostnameOf(url)
  if (host === null) return true
  return !['localhost', '127.0.0.1', '::1'].includes(host)
}

function assertNoCleartext(url) {
  const insecure = /[?&]sslmode=(disable|no-verify)\b/i.test(url)
  // uselibpqcompat changes `require`/`prefer` back to weaker libpq semantics
  // (certificate verification off) on node-postgres.
  const libpqCompat = /[?&]uselibpqcompat=/i.test(url)
  if (!insecure && !libpqCompat) return
  const host = hostnameOf(url)
  const local = host === null || ['localhost', '127.0.0.1', '::1'].includes(host)
  if (!local) {
    throw new Error(
      'Refusing a remote database URL with sslmode=disable/no-verify or ' +
        'uselibpqcompat: the database password or TLS validation would be ' +
        'compromised. Use sslmode=require.',
    )
  }
}

async function main() {
  if (process.env.DB_MIGRATE_SKIP === '1') {
    console.warn('[db-migrate] skipped (DB_MIGRATE_SKIP=1)')
    return
  }

  const onVercel = process.env.VERCEL === '1'
  const vercelEnv = process.env.VERCEL_ENV
  if (onVercel && !vercelEnv) {
    // Do not guess whether an unknown Vercel build is production.
    throw new Error(
      'VERCEL_ENV is not exposed on this Vercel build. Enable "Automatically ' +
        'expose System Environment Variables" in the project settings, or set ' +
        'DB_MIGRATE_SKIP=1 to bypass the schema apply.',
    )
  }
  if (
    vercelEnv &&
    vercelEnv !== 'production' &&
    process.env.DB_MIGRATE_ALLOW_PREVIEW !== '1'
  ) {
    console.log(
      `[db-migrate] skipped: VERCEL_ENV=${vercelEnv} (set DB_MIGRATE_ALLOW_PREVIEW=1 to allow)`,
    )
    return
  }

  const candidates = resolveDbUrls()
  if (candidates.length === 0) {
    throw new Error(
      'No Postgres connection string found. For the Vercel Supabase ' +
        'integration, ensure it exports POSTGRES_URL / POSTGRES_URL_NON_POOLING ' +
        '(a pooler, IPv4 URL), or set SUPABASE_DB_URL to the Supabase Session ' +
        'pooler string. The Direct connection (db.<ref>.supabase.co) is ' +
        'IPv6-only and will not connect from Vercel.',
    )
  }

  const sql = await readFile(SQL_PATH, 'utf8')

  // Try each configured URL until one connects (the integration's direct URL is
  // IPv6-only on many projects), then apply once.
  let client = null
  let usedName = null
  const failures = []
  for (const candidate of candidates) {
    assertNoCleartext(candidate.url)
    const attempt = new pg.Client({
      connectionString: candidate.url,
      // An explicit sslmode in the URL wins (Supabase recommends `sslmode=require`,
      // which the pinned node-postgres verifies like `verify-full`). Otherwise use
      // TLS validation for remote hosts. Never disable TLS for a remote database.
      ...(needsForcedSsl(candidate.url)
        ? { ssl: { rejectUnauthorized: true } }
        : {}),
      connectionTimeoutMillis: 20000,
      application_name: 'nebula-noir-db-migrate',
    })
    try {
      await attempt.connect()
      client = attempt
      usedName = candidate.name
      break
    } catch (error) {
      failures.push(`${candidate.name}: ${redact(error)}`)
      await attempt.end().catch(() => {})
    }
  }

  if (!client) {
    throw new Error(
      `could not connect with any configured Postgres URL (${failures.join('; ')})`,
    )
  }
  console.log(`[db-migrate] connected via ${usedName}`)

  try {
    await client.query('begin')
    // Session-local limits; released with the transaction.
    await client.query("set local statement_timeout = '120s'")
    await client.query("set local lock_timeout = '30s'")
    // Serialize concurrent deployments (rollback releases this automatically).
    // Inlined constant (no bound parameter) so it also works behind a pooler.
    await client.query(`select pg_advisory_xact_lock(${ADVISORY_LOCK_KEY})`)
    // Multi-statement simple query (no parameters) executes the whole file.
    await client.query(sql)
    await client.query('commit')
    console.log(
      '[db-migrate] applied supabase/reset.sql (additive, idempotent)',
    )
  } catch (error) {
    try {
      await client.query('rollback')
    } catch {
      // The connection may already be broken; the transaction is discarded.
    }
    throw error
  } finally {
    await client.end().catch(() => {})
  }
}

loadEnvLocal()

main().catch((error) => {
  const message = redact(error)
  if (process.env.DB_MIGRATE_REQUIRED === '1') {
    console.error(
      `[db-migrate] failed (DB_MIGRATE_REQUIRED=1): ${message}`,
    )
    process.exit(1)
  }
  console.warn(
    `[db-migrate] schema apply skipped, deployment continues (set ` +
      `DB_MIGRATE_REQUIRED=1 to fail the build): ${message}`,
  )
})
