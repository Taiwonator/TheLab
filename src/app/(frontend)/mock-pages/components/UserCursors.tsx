'use client'

import React from 'react'

interface User {
  id: string
  icon: string
  color: string
  cursor: { x: number; y: number; scrollX: number; scrollY: number }
}

interface UserCursorsProps {
  users: User[]
  currentUserId: string | null
}

const UserCursors: React.FC<UserCursorsProps> = ({ users, currentUserId }) => {
  // Filter out the current user
  const otherUsers = users.filter((user) => user.id !== currentUserId)

  return (
    <>
      {otherUsers.map((user) => (
        <div
          key={user.id}
          className="user-cursor"
          style={{
            position: 'fixed',
            left: `${user.cursor.x}px`,
            top: `${user.cursor.y}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: `translate(-50%, -50%) translate(${-(window.scrollX - user.cursor.scrollX)}px, ${-(window.scrollY - user.cursor.scrollY)}px)`,
          }}
        >
          <div
            className="cursor"
            style={{
              borderColor: user.color,
              backgroundColor: user.color,
            }}
          />
          <div
            className="cursor-icon"
            style={{
              borderColor: user.color,
              color: 'white',
            }}
          >
            {user.icon}
          </div>
        </div>
      ))}
    </>
  )
}

export default UserCursors
