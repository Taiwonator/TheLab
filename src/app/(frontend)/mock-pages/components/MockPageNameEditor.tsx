'use client'

import React, { useState } from 'react'
import { MockPage } from '@/payload-types'
import MockPageForm from './MockPageForm'

interface MockPageNameEditorProps {
  mockPage: MockPage
  onUpdate?: (updatedPage: MockPage) => void
  showPlaygroundButton?: boolean
}

const MockPageNameEditor: React.FC<MockPageNameEditorProps> = ({
  mockPage,
  onUpdate,
  showPlaygroundButton = true,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [updatedPage, setUpdatedPage] = useState<MockPage>(mockPage)

  const handleUpdatePage = async (data: { name: string }) => {
    try {
      const response = await fetch('/api/mock-pages/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: mockPage.id,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update mock page')
      }

      // Update the local state with the updated page
      const updated = { ...mockPage, ...data }
      setUpdatedPage(updated)

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updated)
      }

      setIsEditing(false)

      // Reload the page to reflect changes
      window.location.reload()
    } catch (error) {
      console.error('Error updating mock page:', error)
      throw error
    }
  }

  return (
    <div className="mock-page-name-editor">
      <div className="page-header">
        <div className="page-title">
          <a href="/mock-pages" className="back-arrow">
            ←
          </a>
          <h1>{updatedPage.name}</h1>
        </div>
        <div className="page-actions-header">
          <button className="edit-name-button" onClick={() => setIsEditing(true)}>
            Edit Name
          </button>
          {showPlaygroundButton && (
            <a href={`/mock-pages/${mockPage.id}/playground`} className="prototype-button">
              View Playground
              <span className="prototype-emoji">🚀</span>
            </a>
          )}
        </div>
      </div>

      {isEditing && (
        <MockPageForm
          title="Edit Mock Page Name"
          mockPage={updatedPage}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdatePage}
        />
      )}
    </div>
  )
}

export default MockPageNameEditor
