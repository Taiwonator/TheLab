import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import '@(frontend)/_styles/globals.css'
import { Button } from '@(frontend)/_components/ui/button'
import { ThemeSelect } from '@(frontend)/_components/theme-select'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (true) {
    return (
      <div className="container mx-auto p-4 flex flex-col min-h-screen justify-between grow">
        <div className="mx-auto flex flex-col gap-4 grow justify-center">
          {!user && <h1 className="text-2xl font-bold">Welcome to The Lab 🚀.</h1>}
          {user && <h1>Welcome back, {user.email}</h1>}
          <div className="flex flex-col gap-2 justify-center">
            <Button asChild>
              <Link href="/mock-pages">Mock Pages ⭐</Link>
            </Button>
            <Button asChild>
              <Link href="/quests"> Quests 🛡️</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                className="admin"
                href={payloadConfig.routes.admin}
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to admin panel
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto text-sm text-center flex flex-col gap-2 items-center p-4 md:flex-row">
          <p>Experimental tools helpful to the</p>
          <Button
            className="px-2 hover:bg-figma-purple hover:text-white focus:bg-figma-purple focus:text-white"
            variant="outline"
            asChild
          >
            <Link href="https://michaeltaiwo.com/">
              <code className="px-1">Michael Taiwo 🎉</code>
            </Link>
          </Button>
          <ThemeSelect />
        </div>
      </div>
    )
  }
}
