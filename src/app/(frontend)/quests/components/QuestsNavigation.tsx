'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@(frontend)/lib/utils'

const navItems = [
  { href: '/quests/create', label: 'Create' },
  { href: '/quests/impact-network', label: 'Impact Network' },
  { href: '/quests', label: 'All Quests', exact: true },
  { href: '/quests/game-board', label: 'Game Board' },
]

export function QuestsNavigation() {
  const pathname = usePathname()

  return (
    <nav>
      <ul className="flex space-x-6">
        {navItems.map((item) => {
          // Check if the current path matches this nav item
          const isActive = item.exact 
            ? pathname === item.href
            : pathname.startsWith(item.href)
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
