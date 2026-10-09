import 'server-only'
import { isR2Configured } from '@/lib/env'
import { createServiceSupabase } from '@/lib/supabase/service'
import { extensionForMime, isAllowedImageType, uploadToR2 } from '@/lib/r2'
import { feedKeepIds, shouldPruneInstagram } from '@/lib/instagram-keep'
import { loadSecrets, setApiSecret } from '@/lib/secrets/store'

const GRAPH_HOST = 'https://graph.instagram.com'
const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v22.0'

type GraphChild = {
  id?: string
  media_type?: string
  media_url?: string
  thumbnail_url?: string
}

type GraphMedia = {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  permalink?: string
  thumbnail_url?: string
  timestamp?: string
  children?: { data?: GraphChild[] }
}

type GraphErrorBody = {
  error?: { message?: string; type?: string; code?: number }
}

function graphUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${GRAPH_HOST}/${GRAPH_VERSION}/${path.replace(/^\//, '')}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

async function graphGet<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const res = await fetch(graphUrl(path, { ...params, access_token: token }), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const json = (await res.json()) as T & GraphErrorBody
  if (!res.ok || json.error) {
    const message = json.error?.message || `Graph API ${res.status}`
    throw new Error(message)
  }
  return json
}

function displayImageUrl(item: GraphMedia): string | undefined {
  if (item.media_type === 'VIDEO') {
    return item.thumbnail_url || item.media_url
  }
  if (item.media_type === 'CAROUSEL_ALBUM') {
    const children = item.children?.data ?? []
    const imageChild = children.find((child) => child.media_type === 'IMAGE') || children[0]
    return imageChild?.media_url || imageChild?.thumbnail_url || item.media_url || item.thumbnail_url
  }
  return item.media_url || item.thumbnail_url
}

async function copyStillToR2(url: string, id: string): Promise<string> {
  if (!isR2Configured()) return url
  try {
    const res = await fetch(url)
    if (!res.ok) return url
    const mime = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
    if (!isAllowedImageType(mime)) return url
    const buffer = Buffer.from(await res.arrayBuffer())
    const mapped = extensionForMime(mime)
    const ext = mapped === 'bin' ? 'jpg' : mapped
    return await uploadToR2(`instagram/${id}.${ext}`, buffer, mime)
  } catch {
    return url
  }
}

async function loadAuth(supabase: NonNullable<ReturnType<typeof createServiceSupabase>>) {
  let token: string | undefined
  let userId: string | undefined
  let username: string | undefined
  try {
    const { data } = await supabase
      .from('instagram_auth')
      .select('access_token, user_id, username')
      .eq('id', true)
      .maybeSingle()
    token = (data?.access_token as string | undefined) || undefined
    userId = (data?.user_id as string | undefined) || undefined
    username = (data?.username as string | undefined) || undefined
  } catch {
    // Table may be missing until reset.sql is re-run.
  }
  // Priority: encrypted store (admin override) > legacy refreshed row > env.
  const { values, sources } = await loadSecrets()
  const encryptedToken = sources.instagram_access_token === 'db' ? values.instagram_access_token : undefined
  return {
    token: encryptedToken || token || values.instagram_access_token,
    userId: userId || values.instagram_user_id,
    username,
  }
}

async function saveAuth(
  supabase: NonNullable<ReturnType<typeof createServiceSupabase>>,
  input: { token: string; userId?: string; username?: string; expiresIn?: number }
) {
  // Store the refreshed token encrypted when possible; keep instagram_auth for
  // metadata and as a legacy fallback (empty token when encrypted storage works).
  let legacyToken = input.token
  try {
    const encrypted = await setApiSecret('instagram_access_token', input.token)
    if (encrypted.ok) legacyToken = ''
  } catch (error) {
    console.error('[instagram] failed to store refreshed token encrypted', error)
  }

  const row: Record<string, unknown> = {
    id: true,
    access_token: legacyToken,
    user_id: input.userId ?? null,
    username: input.username ?? null,
    updated_at: new Date().toISOString(),
  }
  // Only touch expires_at when the refresh actually returned a new lifetime.
  if (input.expiresIn) {
    row.expires_at = new Date(Date.now() + input.expiresIn * 1000).toISOString()
  }
  try {
    await supabase.from('instagram_auth').upsert(row)
  } catch (error) {
    console.error('[instagram] failed to persist auth metadata', error)
  }
}

async function refreshLongLivedToken(token: string): Promise<{ token: string; expiresIn?: number } | null> {
  try {
    const url = `${GRAPH_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
    const res = await fetch(url, { cache: 'no-store' })
    const json = (await res.json()) as GraphErrorBody & { access_token?: string; expires_in?: number }
    if (!res.ok || json.error || !json.access_token) return null
    return { token: json.access_token, expiresIn: json.expires_in }
  } catch {
    return null
  }
}

export async function syncInstagramPosts(): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = createServiceSupabase()
  if (!supabase) {
    return { ok: false, count: 0, error: 'Supabase service role is not configured' }
  }

  const auth = await loadAuth(supabase)
  const token = auth.token
  if (!token) {
    return { ok: false, count: 0, error: 'Instagram is not configured' }
  }

  const fields =
    'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{id,media_type,media_url,thumbnail_url}'

  try {
    let userId = auth.userId
    let username = auth.username
    if (!userId) {
      const me = await graphGet<{ id?: string; user_id?: string; username?: string }>('me', token, {
        fields: 'user_id,username,account_type',
      })
      userId = me.user_id || me.id
      username = me.username || username
    }
    if (!userId) {
      return { ok: false, count: 0, error: 'Instagram user id missing' }
    }

    const feed = await graphGet<{ data?: GraphMedia[] }>(`${userId}/media`, token, {
      fields,
      limit: '12',
    })
    const items = feed.data ?? []
    const keepIds = feedKeepIds(items)
    let count = 0
    let failed = false

    for (const item of items) {
      if (!item.id || !item.permalink) continue
      const source = displayImageUrl(item)
      if (!source) continue
      const storedUrl = await copyStillToR2(source, item.id)
      const { error } = await supabase.from('instagram_posts').upsert({
        id: item.id,
        caption: item.caption ?? '',
        media_type: item.media_type ?? 'IMAGE',
        media_url: storedUrl,
        permalink: item.permalink,
        thumbnail_url: storedUrl,
        timestamp: item.timestamp ?? null,
        synced_at: new Date().toISOString(),
      })
      if (error) {
        console.error('[instagram] upsert failed', item.id, error.message)
        failed = true
        continue
      }
      count += 1
    }

    // Refresh even when a row failed, or a stuck post skips renewal until the token dies.
    const refreshed = await refreshLongLivedToken(token)
    await saveAuth(supabase, {
      token: refreshed?.token || token,
      userId,
      username,
      expiresIn: refreshed?.expiresIn,
    })

    if (failed) {
      return { ok: false, count, error: 'Instagram sync incomplete' }
    }

    // Empty feed, or a feed we could not store, must not wipe the table.
    if (shouldPruneInstagram(count, keepIds)) {
      const { error: deleteError } = await supabase.from('instagram_posts').delete().notIn('id', keepIds)
      if (deleteError) {
        console.error('[instagram] prune failed', deleteError.message)
        return { ok: false, count, error: 'Instagram sync incomplete' }
      }
    }

    return { ok: true, count }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Instagram sync failed'
    return { ok: false, count: 0, error: message }
  }
}
