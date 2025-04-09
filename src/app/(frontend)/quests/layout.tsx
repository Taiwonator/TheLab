import '../styles/globals.css'
import Link from 'next/link'
import { QuestsNavigation } from './components/QuestsNavigation'

export const metadata = {
  title: 'Quests',
  description: 'Create and manage quests',
}

export default function QuestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/quests" className="text-xl font-bold">
            Quests
          </Link>
          <QuestsNavigation />
        </div>
      </header>
      {children}
    </div>
  )
}
