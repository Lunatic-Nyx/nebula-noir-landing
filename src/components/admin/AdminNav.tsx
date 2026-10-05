'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ADMIN_NAV_GROUPS, isNavItemActive } from '@/components/admin/admin-nav'

const itemClass = (active: boolean) =>
  `flex min-h-[44px] items-center rounded-sm px-3 py-2 text-sm uppercase tracking-[0.15em] transition-all duration-300 ${
    active
      ? 'bg-foreground text-background bioshock-glow-animated'
      : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
  }`

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.id} className="space-y-2">
          <p className="px-3 text-[0.65rem] uppercase tracking-[0.25em] text-foreground/40">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={itemClass(active)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
