import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

import config from '@/payload.config'
import { MockPage } from '@/payload-types'
import MockPagePlayground from '../../../components/MockPagePlayground'

interface PlaygroundPageProps {
  params: {
    id: string
  }
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id } = params

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch the specific mock page by ID
  let mockPage: MockPage | null = null

  try {
    mockPage = (await payload.findByID({
      collection: 'mock-pages',
      id,
      depth: 2, // Include related data up to 2 levels deep
    })) as MockPage
  } catch (error) {
    console.error('Error fetching mock page:', error)
    notFound()
  }

  if (!mockPage) {
    notFound()
  }

  // Filter out blocks without images if needed
  const blocksWithImages = mockPage.blocks?.filter((block) => block.image) || []

  return (
    <div className="playground-page">
      <MockPagePlayground blocks={blocksWithImages} pageName={mockPage.name} pageId={id} />

      <div className="playground-navigation">
        <a href={`/mock-pages/${id}`} className="back-link">
          Back to Mock Page
        </a>
        <a href="/mock-pages" className="back-link">
          All Mock Pages
        </a>
      </div>
    </div>
  )
}
