#!/usr/bin/env node
/**
 * Applies supabase/reset.sql to the Supabase Postgres database.
 *
 * supabase/reset.sql is additive and idempotent (it never drops tables or
 * deletes application data), so this runner is safe to call on every
 * deployment. It is wired into the Vercel build via vercel.json ("buildCommand").
 *
 * Guarantees:
 * - Runs the whole file inside one transaction and rolls back on error, then
 *   exits non-zero so a broken deploy is not promoted against a half-applied
 *   schema. A cross-deploy advisory lock serializes concurrent builds.
 * - Never logs the connection string or its password.
 * - Production only: a Preview/Development build skips unless explicitly allowed,
 *   so a leaked URL cannot mutate the production database from a branch build.
 * - Fails closed on a production Vercel build that uses Supabase but has no DB
 *   URL, and refuses `sslmode=disable`/`sslmode=no-verify` for a remote host.
 *
 * Env:
 *   SUPABASE_DB_URL            Postgres connection string. Use the Supabase
 *                              "Session pooler" string (IPv4). Example:
 *                              postgresql://postgres.<ref>:<URL-ENCODED-PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
 *   DB_MIGRATE_SKIP=1          Emergency bypass (e.g. database briefly unreachable).
 *   DB_MIGRATE_ALLOW_PREVIEW=1 Allow the apply on a non-production Vercel build.
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
      'Refusing SUPABASE_DB_URL with sslmode=disable/no-verify or ' +
        'uselibpqcompat for a remote host: the database password or TLS ' +
        'validation would be compromised. Use sslmode=require.',
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

  const url = (process.env.SUPABASE_DB_URL ?? '').trim()
  if (!url) {
    // Production that actually talks to Supabase must not silently skip its
    // schema step. Demo Mode (no Supabase URL) and local runs still skip.
    if (vercelEnv === 'production' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error(
        'SUPABASE_DB_URL is not set on a production build that uses Supabase. ' +
          'Set it, or set DB_MIGRATE_SKIP=1 to bypass the schema apply.',
      )
    }
    console.log('[db-migrate] skipped: SUPABASE_DB_URL is not set')
    return
  }

  assertNoCleartext(url)

  const sql = await readFile(SQL_PATH, 'utf8')
  const client = new pg.Client({
    connectionString: url,
    // An explicit sslmode in the URL wins (Supabase recommends `sslmode=require`,
    // which the pinned node-postgres verifies like `verify-full`). Otherwise use
    // TLS validation for remote hosts. Never disable TLS for a remote database.
    ...(needsForcedSsl(url) ? { ssl: { rejectUnauthorized: true } } : {}),
    connectionTimeoutMillis: 20000,
    application_name: 'nebula-noir-db-migrate',
  })

  await client.connect()
  try {
    await client.query('begin')
    // Session-local limits; released with the transaction.
    await client.query("set local statement_timeout = '120s'")
    await client.query("set local lock_timeout = '30s'")
    // Serialize concurrent deployments (rollback releases this automatically).
    await client.query('select pg_advisory_xact_lock($1)', [ADVISORY_LOCK_KEY])
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
    console.error('[db-migrate] failed:', redact(error))
    process.exitCode = 1
  } finally {
    await client.end().catch(() => {})
  }
}

loadEnvLocal()

main().catch((error) => {
  console.error('[db-migrate] fatal:', redact(error))
  process.exit(1)
})
