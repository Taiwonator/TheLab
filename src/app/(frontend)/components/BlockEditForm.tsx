'use client'

import React, { useState, useEffect } from 'react'

// Define a simpler type for user types
interface UserType {
  id: string
  name: string
  color?: number
}

interface BlockEditFormProps {
  onClose: () => void
  onSave: (blockData: { id: string; name: string; userTypes: string[] }) => Promise<void>
  availableUserTypes: UserType[]
  block: {
    id: string
    name: string
    userTypes?: any[]
    image?: any
  }
  title: string
}

const BlockEditForm: React.FC<BlockEditFormProps> = ({
  onClose,
  onSave,
  availableUserTypes,
  block,
  title,
}) => {
  const [name, setName] = useState(block.name || '')
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>(
    block.userTypes
      ?.map((userType) => (typeof userType === 'string' ? userType : userType.id || ''))
      .filter(Boolean) || [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug props and state
  useEffect(() => {
    console.log('BlockEditForm - Block:', block)
    console.log('BlockEditForm - Available User Types:', availableUserTypes)
    console.log('BlockEditForm - Selected User Types:', selectedUserTypes)
  }, [block, availableUserTypes, selectedUserTypes])

  // Handle user type selection
  const toggleUserType = (typeId: string) => {
    setSelectedUserTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId)
      } else {
        return [...prev, typeId]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      // Validate form
      if (!name.trim()) {
        setError('Name is required')
        setIsLoading(false)
        return
      }

      // Save the block
      await onSave({
        id: block.id,
        name,
        userTypes: selectedUserTypes,
      })
    } catch (err) {
      console.error('Error updating block:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content block-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Block Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter block name"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>User Types</label>
              <div className="user-types-selector">
                {availableUserTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`user-type-option ${selectedUserTypes.includes(type.id) ? 'selected' : ''}`}
                    data-tag-index={type.color || 0}
                    onClick={() => toggleUserType(type.id)}
                    disabled={isLoading}
                  >
                    {type.name}
                  </button>
                ))}
                {availableUserTypes.length === 0 && (
                  <p className="no-user-types">No user types available. Create user types first.</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Image</label>
              <div className="image-preview">
                {block.image && (
                  <img
                    src={typeof block.image === 'string' ? block.image : block.image.url}
                    alt={block.name}
                    className="preview-image"
                  />
                )}
                <p className="form-help-text">
                  Image cannot be changed. Create a new block if you need to use a different image.
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BlockEditForm
