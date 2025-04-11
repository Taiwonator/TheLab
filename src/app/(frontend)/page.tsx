import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import Link from 'next/link'

import config from '@/payload.config'
import '@(frontend)/styles/mock-pages.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://irp.cdn-website.com/3b1e1eec/dms3rep/multi/BizClik-Transp-RGB.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://irp.cdn-website.com/3b1e1eec/dms3rep/multi/BizClik-Transp-RGB.svg"
            width={65}
          />
        </picture>
        {!user && <h1>Welcome to The Lab 🚀.</h1>}
        {user && <h1>Welcome back, {user.email}</h1>}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          {/* <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a> */}
          {/* <a className="docs" href="/mock-pages">
            Mock Pages ⭐
          </a>
          <a className="docs" href="/quests">
            Quests 🛡️
          </a> */}
          <Link className="docs" href="/mock-pages">
            Mock Pages ⭐
          </Link>
          <Link className="docs" href="/quests">
            Quests 🛡️
          </Link>
        </div>
      </div>
      <div className="footer">
        <p>Experimental tools helpful to the</p>
        <a className="codeLink" href={fileURL}>
          <code>Web Team 🎉</code>
        </a>
      </div>
    </div>
  )
}
