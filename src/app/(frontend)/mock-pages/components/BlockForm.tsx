'use client'

import React, { useState, useRef } from 'react'
// Define a simpler type for user types
interface UserType {
  id: string
  name: string
  color?: number
}

interface BlockFormProps {
  onClose: () => void
  onSave: (blockData: {
    name: string
    userTypes: string[]
    image: File | null
    imageAlt: string
  }) => Promise<void>
  availableUserTypes: UserType[]
  title: string
}

const BlockForm: React.FC<BlockFormProps> = ({ onClose, onSave, availableUserTypes, title }) => {
  const [name, setName] = useState('')
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageAlt, setImageAlt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setImageFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Set default alt text if empty
      if (!imageAlt) {
        setImageAlt(file.name.split('.')[0])
      }
    }
  }

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

      if (!imageFile) {
        setError('Image is required')
        setIsLoading(false)
        return
      }

      if (!imageAlt.trim()) {
        setError('Image alt text is required')
        setIsLoading(false)
        return
      }

      // Save the block
      await onSave({
        name,
        userTypes: selectedUserTypes,
        image: imageFile,
        imageAlt,
      })
    } catch (err) {
      console.error('Error saving block:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving')
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
              <label htmlFor="image">Image</label>
              <div className="image-upload-container">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  disabled={isLoading}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="file-select-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Select Image
                </button>
                <span className="selected-file-name">
                  {imageFile ? imageFile.name : 'No file selected'}
                </span>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="imageAlt">Image Alt Text</label>
              <input
                id="imageAlt"
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="form-input"
                disabled={isLoading}
              />
              <small className="form-help-text">
                Provide a description of the image for screen readers and accessibility.
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BlockForm
