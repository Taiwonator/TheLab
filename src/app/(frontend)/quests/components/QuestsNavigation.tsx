'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@(frontend)/lib/utils'
import { ShareButton } from '@(frontend)/components/ui/share-button'

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
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors py-2 px-2 inline-flex rounded hover:text-primary hover:bg-black/5',
                  isActive
                    ? 'text-primary font-semibold bg-figma-purple-light hover:bg-figma-purple-light'
                    : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
        <li className="relative">
          <ShareButton className="bg-figma-purple text-white hover:bg-figma-purple-light" />
        </li>
      </ul>
    </nav>
  )
}
