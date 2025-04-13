import '../_styles/globals.css'
import Link from 'next/link'
import { QuestsNavigation } from './components/QuestsNavigation'
import { cn } from '@/app/(frontend)/_lib/utils'

export const metadata = {
  title: 'Quests',
  description: 'Create and manage quests',
}

export default function QuestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pokerdot">
      <header className="p-4">
        <div className="container mx-auto py-2 px-4 flex justify-between items-center bg-background rounded-2xl shadow-sm">
          <Link href="/quests" className="text-xl font-bold">
            Quests 🛡️
          </Link>
          <QuestsNavigation />
        </div>
      </header>
      {children}
    </div>
  )
}
