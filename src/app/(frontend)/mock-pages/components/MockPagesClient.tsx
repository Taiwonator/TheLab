'use client'

import React, { useState } from 'react'
import { MockPage } from '@/payload-types'
import MockPageFormWrapper from './MockPageFormWrapper'

interface MockPagesClientProps {
  initialData?: MockPage[]
}

const MockPagesClient: React.FC<MockPagesClientProps> = ({ initialData = [] }) => {
  const [mockPages, setMockPages] = useState<MockPage[]>(initialData)

  const handleUpdateMockPages = (updatedPages: MockPage[]) => {
    setMockPages(updatedPages)
  }

  return (
    <div className="mock-pages-client">
      <MockPageFormWrapper mockPages={mockPages} onUpdate={handleUpdateMockPages} />
    </div>
  )
}

export default MockPagesClient
