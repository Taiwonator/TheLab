'use client'

import React, { useState, useEffect } from 'react'
import { MockPageUser } from '@/payload-types'

interface MagicLinkGeneratorProps {
  pageId: string
}

const MagicLinkGenerator: React.FC<MagicLinkGeneratorProps> = ({ pageId }) => {
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [showPrototype, setShowPrototype] = useState(true)
  const [showCleanView, setShowCleanView] = useState(true)
  const [magicLink, setMagicLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [availableUserTypes, setAvailableUserTypes] = useState<MockPageUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch available user types
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user-types')
        const data = await response.json()
        if (response.ok) {
          setAvailableUserTypes(data.userTypes || [])
        }
      } catch (error) {
        console.error('Error fetching user types:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserTypes()
  }, [])

  // Generate the magic link whenever selections change
  useEffect(() => {
    const baseUrl = window.location.origin
    const userTypesParam =
      selectedUserTypes.length > 0 ? `&userTypes=${selectedUserTypes.join(',')}` : ''

    // Include cleanView parameter based on showCleanView state
    const cleanViewParam = showPrototype ? `&cleanView=${showCleanView}` : ''
    const link = `${baseUrl}/mock-pages/${pageId}/playground?prototype=${showPrototype}${cleanViewParam}${userTypesParam}`
    setMagicLink(link)
  }, [pageId, selectedUserTypes, showPrototype, showCleanView])

  // Toggle a user type selection
  const toggleUserType = (typeId: string) => {
    setSelectedUserTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId)
      } else {
        return [...prev, typeId]
      }
    })
  }

  // Copy the magic link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(magicLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="magic-link-generator">
      <h3>Generate Magic Link</h3>
      <p className="generator-description">
        Create a link that automatically opens the prototype view with specific user type filters.
      </p>

      <div className="generator-options">
        <div className="generator-section">
          <h4>Prototype View</h4>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showPrototype}
              onChange={() => setShowPrototype(!showPrototype)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">{showPrototype ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        {showPrototype && (
          <div className="generator-section">
            <h4>Clean View</h4>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showCleanView}
                onChange={() => setShowCleanView(!showCleanView)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">{showCleanView ? 'Enabled' : 'Disabled'}</span>
            </label>
            <p className="toggle-description">
              Clean view hides user type tags and other UI elements in the prototype view.
            </p>
          </div>
        )}

        <div className="generator-section">
          <h4>Filter by User Types</h4>
          {isLoading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>Loading user types...</p>
            </div>
          ) : availableUserTypes.length > 0 ? (
            <div className="user-types-selector">
              {availableUserTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`user-type-option ${selectedUserTypes.includes(type.id) ? 'selected' : ''}`}
                  data-tag-index={type.color || 0}
                  onClick={() => toggleUserType(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="no-user-types">No user types available.</p>
          )}
        </div>
      </div>

      <div className="magic-link-result">
        <h4>Magic Link</h4>
        <div className="link-container">
          <input
            type="text"
            value={magicLink}
            readOnly
            className="link-input"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className="copy-button" onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="link-help">
          {selectedUserTypes.length > 0
            ? `This link will open the prototype with ${selectedUserTypes.length} user type filter(s).`
            : 'This link will open the prototype with no filters.'}
        </p>
      </div>
    </div>
  )
}

export default MagicLinkGenerator
