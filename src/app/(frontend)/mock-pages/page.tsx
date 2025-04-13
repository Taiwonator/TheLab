import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import MockPagesClient from './components/MockPagesClient'
import MockPageUserFormWrapper from './components/MockPageUserFormWrapper'
import { MockPage, MockPageUser } from '@/payload-types'

export default async function MockPagesPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch mock pages data
  const mockPagesResponse = await payload.find({
    collection: 'mock-pages',
    depth: 2, // Include related data up to 2 levels deep
  })

  const mockPages = mockPagesResponse.docs as MockPage[]

  // Fetch mock page users data
  const mockPageUsersResponse = await payload.find({
    collection: 'mock-page-users',
  })

  const mockPageUsers = mockPageUsersResponse.docs as MockPageUser[]

  return (
    <div className="mock-pages-page">
      <h1>Mock Pages Management</h1>
      <p>Create and manage mock pages and user types for your application.</p>

      <div className="section">
        <div className="section-header">
          <h2>Mock Pages</h2>
          <p>Create and edit mock pages that can be used for prototyping.</p>
        </div>
        {/* Client component for mock pages with create/edit functionality */}
        <MockPagesClient initialData={mockPages} />
      </div>

      <div className="section-header">
        <h2>Mock Page Users</h2>
        <p>User types that can be assigned to blocks in mock pages.</p>
      </div>

      {/* Client component for mock page users with create/edit functionality */}
      <div className="section">
        <MockPageUserFormWrapper initialData={mockPageUsers} />
      </div>

      <div className="back-link">
        <Link href="/">Back to Home</Link>
      </div>
    </div>
  )
}
