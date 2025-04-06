'use client'

import React from 'react'

// Array of cute icons to use for connected users
const CUTE_ICONS = [
  '👩',
  '👨',
  '👧',
  '👦',
  '👶',
  '👵',
  '👴',
  '🧑',
  '👱',
  '👸',
  '🤴',
  '👰',
  '🤵',
  '🧙',
  '🧚',
  '🧛',
  '🦸',
  '🦹',
]

interface User {
  id: string
  icon: string
  color: string
  cursor: { x: number; y: number }
}

interface ConnectedUsersProps {
  count: number
  users: User[]
}

const ConnectedUsers: React.FC<ConnectedUsersProps> = ({ count, users }) => {
  // If no users are provided, create placeholder users
  const displayUsers =
    users.length > 0
      ? users.slice(0, Math.min(count, 5))
      : Array.from({ length: Math.min(count, 5) }, (_, i) => ({
          id: `placeholder-${i}`,
          color: getRandomColor(i),
          icon: getRandomIcon(i),
          cursor: { x: 0, y: 0 },
        }))

  // Generate a random color for each user
  function getRandomColor(index: number) {
    const colors = [
      '#FF5733', // Red-Orange
      '#33FF57', // Green
      '#3357FF', // Blue
      '#FF33F5', // Pink
      '#F5FF33', // Yellow
      '#33FFF5', // Cyan
      '#FF5733', // Orange
      '#C133FF', // Purple
      '#33FF57', // Lime
      '#3357FF', // Royal Blue
    ]
    return colors[index % colors.length]
  }

  // Generate a random icon for each user
  function getRandomIcon(index: number) {
    return CUTE_ICONS[index % CUTE_ICONS.length]
  }

  return (
    <div className="connected-users-container">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className="user-icon"
          style={{
            borderColor: user.color,
            zIndex: displayUsers.length - index, // Decreasing z-index from left to right
          }}
          data-count={index === 0 && count > 5 ? count : ''}
        >
          {user.icon}
        </div>
      ))}
    </div>
  )
}

export default ConnectedUsers
