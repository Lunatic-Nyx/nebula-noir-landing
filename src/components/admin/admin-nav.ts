interface AdminNavItem {
  href: string
  label: string
  exact?: boolean
}

interface AdminNavGroup {
  id: string
  label: string
  items: AdminNavItem[]
}

// Admin is a German-only operator surface (product decision).
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Übersicht',
    items: [{ href: '/admin', label: 'Dashboard', exact: true }],
  },
  {
    id: 'content',
    label: 'Inhalte',
    items: [
      { href: '/admin/gallery', label: 'Galerie' },
      { href: '/admin/events', label: 'Events' },
      { href: '/admin/info', label: 'Marken-Texte' },
      { href: '/admin/categories', label: 'Kategorien' },
      { href: '/admin/hero', label: 'Hero-Video' },
    ],
  },
  {
    id: 'site',
    label: 'Website',
    items: [{ href: '/admin/content', label: 'Texte & Übersetzungen' }],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { href: '/admin/inquiries', label: 'Anfragen' },
      { href: '/admin/instagram', label: 'Instagram' },
      { href: '/admin/secrets', label: 'API-Keys' },
      { href: '/admin/health', label: 'API-Status' },
    ],
  },
]

const ALL_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

function resolveActiveNavItem(pathname: string): AdminNavItem | null {
  let best: AdminNavItem | null = null
  for (const item of ALL_ITEMS) {
    const matches = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
    if (!matches) continue
    if (!best || item.href.length > best.href.length) best = item
  }
  return best
}

export function isNavItemActive(pathname: string, item: AdminNavItem): boolean {
  return resolveActiveNavItem(pathname)?.href === item.href
}
