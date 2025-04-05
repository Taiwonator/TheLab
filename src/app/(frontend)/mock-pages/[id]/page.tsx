import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

import config from '@/payload.config'
import { MockPage } from '@/payload-types'
import MockPageBlocksClient from '../../components/MockPageBlocksClient'
import MockPageNameEditor from '../../components/MockPageNameEditor'
import MagicLinkGenerator from '../../components/MagicLinkGenerator'

export type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MockPageDetail({ params }: PageProps) {
  const { id } = await params
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

  return (
    <div className="mock-page-detail">
      {/* Name Editor with Edit Button */}
      <MockPageNameEditor mockPage={mockPage} />

      {/* Page Info Section */}
      <div className="page-info-section">
        <p>Created: {new Date(mockPage.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(mockPage.updatedAt).toLocaleString()}</p>
      </div>

      {/* Magic Link Generator */}
      <div className="magic-link-section">
        <MagicLinkGenerator pageId={id} />
      </div>

      {/* Client component to log and display blocks */}
      <MockPageBlocksClient blocks={mockPage.blocks || []} pageId={id} />

      {/* Page actions moved to the header */}
    </div>
  )
}
