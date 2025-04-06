'use client'

import React, { useEffect, useState } from 'react'
import { Media, MockPageUser } from '@/payload-types'
import BlockEditForm from './BlockEditForm'

interface Block {
  id?: string | null
  name: string
  image: string | Media
  userTypes?: (string | MockPageUser)[] | null
}

interface MockPageBlocksClientProps {
  blocks: Block[]
  pageId: string
}

const MockPageBlocksClient: React.FC<MockPageBlocksClientProps> = ({ blocks, pageId }) => {
  // State for block editing
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [availableUserTypes, setAvailableUserTypes] = useState<any[]>([])
  const [saveMessage, setSaveMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Function to update a block
  const updateBlock = async (blockData: { id: string; name: string; userTypes: string[] }) => {
    try {
      setIsLoading(true)

      // Send the data to the API
      const response = await fetch(`/api/mock-pages/${pageId}/blocks/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockId: blockData.id,
          name: blockData.name,
          userTypes: blockData.userTypes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update block')
      }

      // Close the form and show success message
      setEditingBlock(null)
      setSaveMessage('Block updated successfully!')

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating block:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Log the blocks to the console
    console.log('Mock Page Blocks:', blocks)
  }, [blocks])

  // Debug user types
  useEffect(() => {
    console.log('Available User Types:', availableUserTypes)
  }, [availableUserTypes])

  return (
    <div className="blocks-section">
      <h2>Blocks</h2>
      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}
      {blocks.length > 0 ? (
        <div className="blocks-grid">
          {blocks.map((block, index) => {
            const imageUrl = typeof block.image === 'string' ? block.image : block.image?.url
            const imageAlt =
              typeof block.image === 'string' ? block.name : block.image?.alt || block.name

            return (
              <div key={block.id || index} className="block-item">
                <div className="block-header">
                  <h3>{block.name}</h3>
                  {block.id && (
                    <button
                      className="edit-button block-edit-button"
                      onClick={() => setEditingBlock(block)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {imageUrl && (
                  <div className="block-image">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      width={300}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}

                {block.userTypes && block.userTypes.length > 0 && (
                  <div className="block-user-types">
                    <h4>User Types:</h4>
                    <ul>
                      {block.userTypes.map((userType, idx) => {
                        const typeName = typeof userType === 'string' ? userType : userType.name
                        const typeId = typeof userType === 'string' ? null : userType.id

                        return <li key={typeId || idx}>{typeName}</li>
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p>No blocks found for this page.</p>
      )}

      {/* Block Edit Modal */}
      {editingBlock && (
        <BlockEditForm
          onClose={() => setEditingBlock(null)}
          onSave={updateBlock}
          availableUserTypes={availableUserTypes}
          block={editingBlock as { id: string; name: string; userTypes?: any[]; image?: any }}
          title="Edit Block"
        />
      )}
    </div>
  )
}

export default MockPageBlocksClient
