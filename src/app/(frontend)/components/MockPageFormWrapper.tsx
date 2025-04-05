'use client'

import React, { useState } from 'react'
import { MockPage } from '@/payload-types'
import MockPageForm from './MockPageForm'

interface MockPageFormWrapperProps {
  mockPages: MockPage[]
  onUpdate: (updatedPages: MockPage[]) => void
}

const MockPageFormWrapper: React.FC<MockPageFormWrapperProps> = ({ mockPages, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [editingPage, setEditingPage] = useState<MockPage | null>(null)

  const handleCreatePage = async (data: { name: string }) => {
    try {
      const response = await fetch('/api/mock-pages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create mock page')
      }

      // Update the local state with the new page
      onUpdate([...mockPages, result.page])
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating mock page:', error)
      throw error
    }
  }

  const handleUpdatePage = async (data: { name: string }) => {
    if (!editingPage) return

    try {
      const response = await fetch('/api/mock-pages/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingPage.id,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update mock page')
      }

      // Update the local state with the updated page
      const updatedPages = mockPages.map((page) =>
        page.id === editingPage.id ? result.page : page,
      )
      onUpdate(updatedPages)
      setEditingPage(null)
    } catch (error) {
      console.error('Error updating mock page:', error)
      throw error
    }
  }

  return (
    <>
      <div className="actions-bar">
        <button className="create-button" onClick={() => setIsCreating(true)}>
          + Create Mock Page
        </button>
      </div>

      {isCreating && (
        <MockPageForm
          title="Create Mock Page"
          onClose={() => setIsCreating(false)}
          onSave={handleCreatePage}
        />
      )}

      {editingPage && (
        <MockPageForm
          title="Edit Mock Page"
          mockPage={editingPage}
          onClose={() => setEditingPage(null)}
          onSave={handleUpdatePage}
        />
      )}

      <div className="mock-pages-list">
        {mockPages.length > 0 ? (
          <ul className="full-width-list">
            {mockPages.map((page) => (
              <li key={page.id} className="mock-page-item">
                <div className="mock-page-content">
                  <div className="mock-page-info">
                    <div className="mock-page-name">{page.name}</div>
                    <div className="mock-page-id">{page.id}</div>
                  </div>
                  <div className="mock-page-actions">
                    <a href={`/mock-pages/${page.id}`} className="edit-blocks-button">
                      Edit Blocks | {page.blocks?.length || 0} blocks
                    </a>
                    <a href={`/mock-pages/${page.id}/playground`} className="prototype-button">
                      View Playground
                      <span className="prototype-emoji">🚀</span>
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No mock pages found.</p>
        )}
      </div>
    </>
  )
}

export default MockPageFormWrapper
