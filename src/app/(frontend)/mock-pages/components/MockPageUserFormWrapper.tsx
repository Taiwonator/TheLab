'use client'

import React, { useState } from 'react'
import { MockPageUser } from '@/payload-types'
import MockPageUserForm from './MockPageUserForm'

interface MockPageUserFormWrapperProps {
  initialData: MockPageUser[]
}

const MockPageUserFormWrapper: React.FC<MockPageUserFormWrapperProps> = ({ initialData = [] }) => {
  const [mockPageUsers, setMockPageUsers] = useState<MockPageUser[]>(initialData)
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<MockPageUser | null>(null)

  const handleCreateUser = async (data: { name: string }) => {
    try {
      const response = await fetch('/api/mock-page-users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create mock page user')
      }

      // Update the local state with the new user
      setMockPageUsers([...mockPageUsers, result.user])
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating mock page user:', error)
      throw error
    }
  }

  const handleUpdateUser = async (data: { name: string }) => {
    if (!editingUser) return

    try {
      const response = await fetch('/api/mock-page-users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update mock page user')
      }

      // Update the local state with the updated user
      const updatedUsers = mockPageUsers.map((user) =>
        user.id === editingUser.id ? result.user : user,
      )
      setMockPageUsers(updatedUsers)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating mock page user:', error)
      throw error
    }
  }

  return (
    <>
      <div className="actions-bar">
        <button className="create-button" onClick={() => setIsCreating(true)}>
          + Create User Type
        </button>
      </div>

      {isCreating && (
        <MockPageUserForm
          title="Create User Type"
          onClose={() => setIsCreating(false)}
          onSave={handleCreateUser}
        />
      )}

      {editingUser && (
        <MockPageUserForm
          title="Edit User Type"
          mockPageUser={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      <div className="mock-page-users-list">
        {mockPageUsers.length > 0 ? (
          <ul className="full-width-list">
            {mockPageUsers.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-content">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-id">{user.id}</div>
                  </div>
                  <div className="user-actions">
                    <button className="edit-button" onClick={() => setEditingUser(user)}>
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No mock page users found.</p>
        )}
      </div>
    </>
  )
}

export default MockPageUserFormWrapper
