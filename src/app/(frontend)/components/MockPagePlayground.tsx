'use client'

import React, { useEffect, useState, Fragment } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import BlockForm from './BlockForm'
import BlockEditForm from './BlockEditForm'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import PaintingLoader from './PaintingLoader'
import { Media, MockPageUser } from '@/payload-types'

interface Block {
  id?: string | null
  name: string
  image: string | Media
  userTypes?: (string | MockPageUser)[] | null
}

interface MockPagePlaygroundProps {
  blocks: Block[]
  pageName: string
  pageId: string
}

const MockPagePlayground: React.FC<MockPagePlaygroundProps> = ({
  blocks: initialBlocks,
  pageName,
  pageId,
}) => {
  // State to manage the order of blocks
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  // State for filtering by user types (multiple selection)
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  // State to store all available user types
  const [availableUserTypes, setAvailableUserTypes] = useState<
    { id: string; name: string; color: number }[]
  >([])

  // Fetch available user types from API
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await fetch('/api/user-types')
        const data = await response.json()
        if (response.ok) {
          // Map the user types to the format we need
          const userTypesArray = data.userTypes.map((userType: any, idx: number) => ({
            id: userType.id,
            name: userType.name,
            color: idx % 10, // Use modulo 10 for our 10 colors
          }))
          setAvailableUserTypes(userTypesArray)
          console.log('Playground - Available User Types:', userTypesArray)
        }
      } catch (error) {
        console.error('Error fetching user types:', error)
      }
    }

    fetchUserTypes()

    // Also extract user types from blocks as a fallback
    const userTypesMap = new Map<string, { name: string; color: number }>()

    initialBlocks.forEach((block) => {
      if (block.userTypes && block.userTypes.length > 0) {
        block.userTypes.forEach((userType, idx) => {
          const typeName = typeof userType === 'string' ? userType : userType.name
          const typeId =
            typeof userType === 'string' ? `type-${typeName}` : userType.id || `type-${typeName}`

          if (!userTypesMap.has(typeId)) {
            userTypesMap.set(typeId, {
              name: typeName,
              color: idx % 10, // Use modulo 10 for our 10 colors
            })
          }
        })
      }
    })

    // If we don't get user types from the API, use the ones from blocks
    if (availableUserTypes.length === 0) {
      const userTypesArray = Array.from(userTypesMap.entries()).map(([id, { name, color }]) => ({
        id,
        name,
        color,
      }))

      if (userTypesArray.length > 0) {
        setAvailableUserTypes(userTypesArray)
        console.log('Playground - Fallback User Types:', userTypesArray)
      }
    }
  }, [initialBlocks, availableUserTypes.length])

  // Filter blocks based on selected user types
  const filteredBlocks =
    selectedUserTypes.length > 0
      ? blocks.filter((block) =>
          block.userTypes?.some((userType) => {
            const typeId =
              typeof userType === 'string'
                ? `type-${userType}`
                : userType.id || `type-${userType.name}`
            return selectedUserTypes.includes(typeId)
          }),
        )
      : blocks

  // Set loading state to false after blocks are loaded
  useEffect(() => {
    if (blocks.length > 0 || initialBlocks.length === 0) {
      // Initialize loading state for all blocks
      const loadingState: Record<string, boolean> = {}
      blocks.forEach((block, index) => {
        loadingState[block.id || `block-${index}`] = true
      })
      setLoadingImages(loadingState)

      // Add a small delay to show loading state even if blocks load quickly
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [blocks, initialBlocks])

  useEffect(() => {
    // Log the blocks to the console
    console.log('Playground Blocks:', blocks)
  }, [blocks])

  // Handle the end of a drag operation
  const handleDragEnd = (result: DropResult) => {
    console.log('Drag end event:', result)

    // If dropped outside the list or no destination
    if (!result.destination) {
      console.log('No destination, ignoring drag')
      return
    }

    // If the item was dropped in the same position
    if (result.destination.index === result.source.index) {
      console.log('Same position, ignoring drag')
      return
    }

    // Reorder the blocks array
    console.log('Reordering blocks from', result.source.index, 'to', result.destination.index)
    const reorderedBlocks = Array.from(blocks)
    const [removed] = reorderedBlocks.splice(result.source.index, 1)
    reorderedBlocks.splice(result.destination.index, 0, removed)

    // Update state with the new order
    console.log('Setting new blocks order')
    setBlocks(reorderedBlocks)
  }

  // State to track saving status
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // State for prototype modal
  const [showPrototypeModal, setShowPrototypeModal] = useState(false)
  // State for clean view toggle (hide block names and tags)
  const [cleanView, setCleanView] = useState(false)
  // State for prototype loading
  const [prototypeLoading, setPrototypeLoading] = useState(false)
  // State for loading blocks
  const [isLoading, setIsLoading] = useState(true)
  // State for tracking which images are still loading
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({})
  // State for block creation modal
  const [showBlockForm, setShowBlockForm] = useState(false)
  // State for block editing
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  // State for block deletion
  const [deletingBlock, setDeletingBlock] = useState<Block | null>(null)
  // State for delete loading
  const [isDeleting, setIsDeleting] = useState(false)

  // Function to handle filter selection (toggle selection)
  const handleFilterChange = (typeId: string) => {
    setSelectedUserTypes((prev) => {
      // If already selected, remove it
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId)
      }
      // Otherwise, add it
      return [...prev, typeId]
    })
  }

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedUserTypes([])
  }

  // Function to save the current order to the database
  const saveOrder = async () => {
    // Don't allow saving when filtering is active
    if (selectedUserTypes.length > 0) {
      setSaveMessage('Please clear all filters before saving')
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
      return
    }

    try {
      setIsSaving(true)
      setSaveMessage('Saving changes...')

      console.log('Saving new block order to database:', blocks)

      const response = await fetch('/api/mock-pages/update-blocks-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pageId,
          blocks: blocks,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save block order')
      }

      setSaveMessage('Changes saved successfully!')
      console.log('Save successful:', result)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error saving block order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`Error: ${errorMessage}`)

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to create a new block
  const createBlock = async (blockData: {
    name: string
    userTypes: string[]
    image: File | null
    imageAlt: string
  }) => {
    try {
      setIsLoading(true)

      // Create a FormData object to send the image
      const formData = new FormData()
      formData.append('name', blockData.name)
      formData.append('imageAlt', blockData.imageAlt)
      formData.append('userTypes', JSON.stringify(blockData.userTypes))

      if (blockData.image) {
        formData.append('image', blockData.image)
      }

      // Send the data to the API
      const response = await fetch(`/api/mock-pages/${pageId}/blocks/create`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create block')
      }

      // Add the new block to the blocks array
      setBlocks((prev) => [...prev, result.block])

      // Close the form and show success message
      setShowBlockForm(false)
      setSaveMessage('Block created successfully!')

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error creating block:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

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

      // Update the block in the blocks array
      setBlocks((prev) => prev.map((block) => (block.id === blockData.id ? result.block : block)))

      // Close the form and show success message
      setEditingBlock(null)
      setSaveMessage('Block updated successfully!')

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating block:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to delete a block
  const deleteBlock = async (blockId: string) => {
    try {
      setIsDeleting(true)

      // Send the data to the API
      const response = await fetch(`/api/mock-pages/${pageId}/blocks/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete block')
      }

      // Remove the block from the blocks array
      setBlocks((prev) => prev.filter((block) => block.id !== blockId))

      // Close the confirmation modal and show success message
      setDeletingBlock(null)
      setSaveMessage('Block deleted successfully!')

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error deleting block:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage(`Error: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Process URL parameters
  useEffect(() => {
    // Only run once when component mounts
    const processUrlParams = () => {
      if (availableUserTypes.length === 0) return

      // Get URL parameters
      const params = new URLSearchParams(window.location.search)
      const prototype = params.get('prototype')
      const userTypesParam = params.get('userTypes')
      const cleanViewParam = params.get('cleanView')

      // Handle prototype parameter
      if (prototype === 'true') {
        setShowPrototypeModal(true)
        // Set clean view based on cleanView parameter, default to true
        setCleanView(cleanViewParam !== 'false')
      }

      // Handle userTypes parameter
      if (userTypesParam) {
        const userTypeIds = userTypesParam.split(',').filter(Boolean)

        // Check if the user type IDs exist in availableUserTypes
        const validUserTypeIds = userTypeIds.filter((id) =>
          availableUserTypes.some((userType) => userType.id === id),
        )

        if (validUserTypeIds.length > 0) {
          setSelectedUserTypes(validUserTypeIds)
        }
      }
    }

    processUrlParams()
  }, [availableUserTypes, setShowPrototypeModal, setSelectedUserTypes])

  // console.log('MockPagePlayground rendering', {
  //   blocksLength: blocks.length,
  //   filteredBlocksLength: filteredBlocks.length,
  //   selectedUserTypes,
  // })

  return (
    <div className="playground-container">
      <div className="playground-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title-container">
              <span className="mode-tag">Playground mode</span>
              <div className="page-title">
                <a href="/mock-pages" className="back-arrow">
                  ←
                </a>
                <h1>{pageName}</h1>
              </div>
            </div>
            <p>Drag and drop blocks to reorder them</p>
            <div className="playground-actions">
              <button
                className={`save-button ${isSaving ? 'saving' : ''} ${selectedUserTypes.length > 0 ? 'disabled' : ''}`}
                onClick={saveOrder}
                disabled={isSaving || selectedUserTypes.length > 0}
              >
                {isSaving ? 'Saving...' : 'Save Order'}
              </button>
              {saveMessage && (
                <div
                  className={`save-message ${saveMessage.includes('Error') || saveMessage.includes('filter') ? 'error' : 'success'}`}
                >
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
          <div className="header-right">
            <button
              className="prototype-button"
              onClick={() => {
                setPrototypeLoading(true)
                setShowPrototypeModal(true)
                // Simulate loading time for the painting effect
                setTimeout(() => {
                  setPrototypeLoading(false)
                }, 2000)
              }}
            >
              <span className="prototype-icon">⚲</span>
              Prototype Preview
              <span className="prototype-emoji">🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Type Filter */}
      <div className="user-type-filter">
        <div className="filter-label">Filter by User Type:</div>
        <div className="filter-options">
          {availableUserTypes.map((type) => (
            <button
              key={type.id}
              className={`filter-option ${selectedUserTypes.includes(type.id) ? 'active' : ''}`}
              data-tag-index={availableUserTypes.findIndex((ut) => ut.id === type.id) % 10}
              onClick={() => handleFilterChange(type.id)}
            >
              {type.name}
            </button>
          ))}
          {availableUserTypes.length > 0 && selectedUserTypes.length > 0 && (
            <button className="clear-filter" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
          {availableUserTypes.length === 0 && (
            <span className="no-filters">No user types available</span>
          )}
        </div>
      </div>

      <div className="playground-content">
        {isLoading ? (
          <div className="blocks-loading">
            <div className="loading-spinner"></div>
            <p>Loading blocks...</p>
          </div>
        ) : filteredBlocks.length > 0 ? (
          <div className="stacked-images-container">
            {selectedUserTypes.length > 0 && (
              <div className="drag-disabled-message">
                <p>Drag and drop is disabled while filtering</p>
              </div>
            )}
            {selectedUserTypes.length > 0 ? (
              // When filters are active, just display the blocks without drag functionality
              <div className="stacked-images">
                {filteredBlocks.map((block, index) => {
                  const imageUrl = typeof block.image === 'string' ? block.image : block.image?.url

                  const imageAlt =
                    typeof block.image === 'string' ? block.name : block.image?.alt || block.name

                  return imageUrl ? (
                    <div key={block.id || `block-${index}`} className="stacked-image-container">
                      <div className="image-label">
                        <div className="label-content">{block.name}</div>
                        <div className="block-actions">
                          <button
                            className="edit-button block-edit-button"
                            onClick={() => setEditingBlock(block)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button block-delete-button"
                            onClick={() => setDeletingBlock(block)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        {block.userTypes && block.userTypes.length > 0 && (
                          <div className="user-types-container">
                            {block.userTypes.map((userType, idx) => {
                              const typeName =
                                typeof userType === 'string' ? userType : userType.name
                              return (
                                <span
                                  key={idx}
                                  className="user-type-tag"
                                  data-tag-index={
                                    availableUserTypes.findIndex((ut) =>
                                      typeof userType === 'string'
                                        ? ut.name === userType
                                        : ut.id === userType.id,
                                    ) % 10
                                  }
                                >
                                  {typeName}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <div
                        className={`image-container ${loadingImages[block.id || `block-${index}`] ? 'loading' : ''}`}
                      >
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="full-width-image"
                          onLoad={() => {
                            setLoadingImages((prev) => ({
                              ...prev,
                              [block.id || `block-${index}`]: false,
                            }))
                          }}
                          onError={() => {
                            setLoadingImages((prev) => ({
                              ...prev,
                              [block.id || `block-${index}`]: false,
                            }))
                          }}
                        />
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              // When no filters are active, use drag and drop
              <Fragment>
                <DragDropContext onDragStart={() => alert('helllo')} onDragEnd={handleDragEnd}>
                  <Droppable
                    droppableId="stacked-images"
                    isDropDisabled={false}
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                  >
                    {(provided) => (
                      <div
                        className="stacked-images"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {filteredBlocks.map((block, index) => {
                          const imageUrl =
                            typeof block.image === 'string' ? block.image : block.image?.url

                          const imageAlt =
                            typeof block.image === 'string'
                              ? block.name
                              : block.image?.alt || block.name

                          const draggableId = String(block.id || `block-${index}`)
                          console.log('index: ', index, block, draggableId)

                          console.log('selectedUserTypes: ', selectedUserTypes.length > 0)

                          return imageUrl ? (
                            <Draggable
                              key={draggableId}
                              draggableId={draggableId}
                              index={index}
                              isDragDisabled={false}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className={`stacked-image-container ${snapshot.isDragging ? 'dragging' : ''}`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="image-label">
                                    <div className="label-content">
                                      <span className="drag-handle">☰</span>
                                      {block.name}
                                    </div>
                                    <div className="block-actions">
                                      <button
                                        className="edit-button block-edit-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingBlock(block)
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="delete-button block-delete-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setDeletingBlock(block)
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          width="16"
                                          height="16"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  {block.userTypes && block.userTypes.length > 0 && (
                                    <div className="user-type-tags">
                                      {block.userTypes.map((userType, idx) => {
                                        const typeName =
                                          typeof userType === 'string' ? userType : userType.name
                                        const typeId =
                                          typeof userType === 'string' ? `type-${idx}` : userType.id

                                        return (
                                          <span
                                            key={typeId}
                                            className="user-type-tag"
                                            data-tag-index={
                                              availableUserTypes.findIndex((ut) =>
                                                typeof userType === 'string'
                                                  ? ut.name === userType
                                                  : ut.id === userType.id,
                                              ) % 10
                                            }
                                          >
                                            {typeName}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  )}
                                  <div
                                    className={`image-container ${loadingImages[block.id || `block-${index}`] ? 'loading' : ''}`}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={imageAlt}
                                      className="full-width-image"
                                      onLoad={() => {
                                        setLoadingImages((prev) => ({
                                          ...prev,
                                          [block.id || `block-${index}`]: false,
                                        }))
                                      }}
                                      onError={() => {
                                        setLoadingImages((prev) => ({
                                          ...prev,
                                          [block.id || `block-${index}`]: false,
                                        }))
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ) : null
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div className="content-actions bottom-actions">
                  <button className="create-button" onClick={() => setShowBlockForm(true)}>
                    + Create Block
                  </button>
                </div>
              </Fragment>
            )}
          </div>
        ) : (
          <div className="no-blocks-message">
            {blocks.length === 0 ? (
              <div className="empty-state">
                <h3>Make Your First Block</h3>
                <p>Create your first block to start building your mock page.</p>
                <button
                  className="create-button empty-state-button"
                  onClick={() => setShowBlockForm(true)}
                >
                  + Create Your First Block
                </button>
              </div>
            ) : selectedUserTypes.length > 0 && blocks.length > 0 ? (
              <p>
                No blocks match the selected filters.
                <button className="inline-clear-filter" onClick={clearFilters}>
                  Clear all filters
                </button>
              </p>
            ) : (
              <p>No blocks with images found for this page.</p>
            )}
          </div>
        )}

        {selectedUserTypes.length > 0 && filteredBlocks.length > 0 && (
          <div className="filter-active-message">
            <p>
              <strong>Filters active:</strong> Showing only blocks with user types:
              {selectedUserTypes.map((typeId) => (
                <span
                  key={typeId}
                  className="inline-filter-tag"
                  data-tag-index={availableUserTypes.find((t) => t.id === typeId)?.color || 0}
                >
                  {availableUserTypes.find((t) => t.id === typeId)?.name}
                </span>
              ))}
              . Drag and drop is disabled while filtering.
            </p>
          </div>
        )}
      </div>

      {/* Prototype Modal */}
      {/* Block Creation Modal */}
      {showBlockForm && (
        <BlockForm
          onClose={() => setShowBlockForm(false)}
          onSave={createBlock}
          availableUserTypes={availableUserTypes}
          title="Create New Block"
        />
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

      {/* Block Delete Confirmation Modal */}
      {deletingBlock && (
        <DeleteConfirmationModal
          onClose={() => setDeletingBlock(null)}
          onConfirm={() => {
            if (deletingBlock.id) {
              deleteBlock(deletingBlock.id)
            }
          }}
          title="Delete Block"
          message="Are you sure you want to delete this block? This action cannot be undone."
          isDeleting={isDeleting}
        />
      )}

      {/* Prototype Modal */}
      {showPrototypeModal && (
        <div className="prototype-wrapper">
          {prototypeLoading && <PaintingLoader />}
          <div className="prototype-modal-overlay" onClick={() => setShowPrototypeModal(false)}>
            <div className="prototype-modal" onClick={(e) => e.stopPropagation()}>
              <div className="prototype-modal-header">
                <div className="prototype-header-content">
                  <div className="prototype-controls">
                    {selectedUserTypes.length > 0 && (
                      <div className="prototype-filter-indicator">
                        <span className="filter-label">Previewing User Types:</span>
                        <div className="filter-values">
                          {selectedUserTypes.map((typeId) => (
                            <span
                              key={typeId}
                              className="filter-value"
                              data-tag-index={
                                availableUserTypes.find((t) => t.id === typeId)?.color || 0
                              }
                            >
                              {availableUserTypes.find((t) => t.id === typeId)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="clean-view-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={cleanView}
                          onChange={() => setCleanView(!cleanView)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="toggle-label">Clean View</span>
                    </div>
                  </div>
                </div>
                <button className="close-modal-button" onClick={() => setShowPrototypeModal(false)}>
                  ×
                </button>
              </div>
              <div className="prototype-modal-content">
                <div className="prototype-canvas">
                  {filteredBlocks.length > 0 ? (
                    <div className="prototype-blocks">
                      {/* Show all blocks, but with different opacity based on filter */}
                      {blocks.map((block, index) => {
                        const imageUrl =
                          typeof block.image === 'string' ? block.image : block.image?.url

                        const imageAlt =
                          typeof block.image === 'string'
                            ? block.name
                            : block.image?.alt || block.name

                        // Check if this block matches any of the current filters
                        const matchesFilter =
                          selectedUserTypes.length === 0 ||
                          block.userTypes?.some((userType) => {
                            const typeId =
                              typeof userType === 'string'
                                ? `type-${userType}`
                                : userType.id || `type-${userType.name}`
                            return selectedUserTypes.includes(typeId)
                          })

                        return imageUrl ? (
                          <div
                            key={block.id || `prototype-block-${index}`}
                            className={`prototype-block ${!matchesFilter ? 'faded' : ''} ${cleanView ? 'clean-view' : ''}`}
                          >
                            {!cleanView && (
                              <div className="prototype-block-header">
                                <span className="prototype-block-name">{block.name}</span>
                                {block.userTypes && block.userTypes.length > 0 && (
                                  <div className="prototype-user-type-tags">
                                    {block.userTypes.map((userType, idx) => {
                                      const typeName =
                                        typeof userType === 'string' ? userType : userType.name
                                      const typeId =
                                        typeof userType === 'string' ? `type-${idx}` : userType.id

                                      return (
                                        <span
                                          key={typeId}
                                          className="prototype-user-type-tag"
                                          data-tag-index={
                                            availableUserTypes.findIndex((ut) =>
                                              typeof userType === 'string'
                                                ? ut.name === userType
                                                : ut.id === userType.id,
                                            ) % 10
                                          }
                                        >
                                          {typeName}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="prototype-image-container">
                              <img src={imageUrl} alt={imageAlt} className="prototype-image" />
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <div className="prototype-no-blocks">
                      <p>No blocks available to preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MockPagePlayground
