import '../styles/globals.css'
import Link from 'next/link'

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
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/quests" className="text-sm font-medium hover:text-primary">
                  All Quests
                </Link>
              </li>
              <li>
                <Link href="/quests/create" className="text-sm font-medium hover:text-primary">
                  Create Quest
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
