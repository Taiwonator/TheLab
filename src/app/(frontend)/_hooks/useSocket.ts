import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface BlockData {
  blocks: any[]
  [key: string]: any
}

interface User {
  id: string
  icon: string
  color: string
  cursor: {
    x: number
    y: number
    scrollX: number
    scrollY: number
  }
}

export function useSocket(pageId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomUsers, setRoomUsers] = useState(1) // Default to 1 (self)
  const [users, setUsers] = useState<User[]>([]) // Store all users with their data

  useEffect(() => {
    let socketInstance: Socket

    // Initialize the socket connection
    const socketInit = async () => {
      try {
        // Connect to the Socket.io server using the environment variable
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000'
        socketInstance = io(socketServerUrl, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling'],
          autoConnect: true,
        })

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id)
          setIsConnected(true)

          // Join the room for this page
          socketInstance.emit('join-page', pageId)
        })

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected')
          setIsConnected(false)
        })

        socketInstance.on('connect_error', (err) => {
          console.error('Socket connection error:', err)
          setIsConnected(false)
        })

        // Listen for room users updates
        socketInstance.on('room-users-updated', (data) => {
          console.log('Room users updated:', data.count, data.users)
          setRoomUsers(data.count)
          setUsers(data.users || [])
        })

        // Listen for cursor updates
        socketInstance.on('cursor-updated', (data) => {
          console.log('Cursor updated:', data)
          setUsers((prevUsers) => {
            const userIndex = prevUsers.findIndex((user) => user.id === data.id)
            if (userIndex !== -1) {
              const updatedUsers = [...prevUsers]
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                cursor: {
                  x: data.x,
                  y: data.y,
                  scrollX: data.scrollX || 0,
                  scrollY: data.scrollY || 0,
                },
              }
              return updatedUsers
            }
            return prevUsers
          })
        })

        setSocket(socketInstance)
      } catch (error) {
        console.error('Error initializing socket:', error)
      }
    }

    socketInit()

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.off('room-users-updated')
        socketInstance.off('cursor-updated')
        socketInstance.disconnect()
      }
    }
  }, [pageId])

  // Function to emit block updates
  const emitBlockUpdate = useCallback(
    (data: BlockData) => {
      if (socket && isConnected) {
        socket.emit('update-blocks', {
          pageId,
          ...data,
        })
      }
    },
    [socket, isConnected, pageId],
  )

  // Function to emit order changes
  const emitOrderChange = useCallback(
    (data: BlockData) => {
      if (socket && isConnected) {
        socket.emit('order-changed', {
          pageId,
          ...data,
        })
      }
    },
    [socket, isConnected, pageId],
  )

  // Function to emit mouse movements
  const emitMouseMove = useCallback(
    (clientX: number, clientY: number, pageX: number, pageY: number) => {
      if (socket && isConnected) {
        // Calculate scroll position from the difference between page and client coordinates
        const scrollX = pageX - clientX
        const scrollY = pageY - clientY

        socket.emit('mouse-move', {
          pageId,
          x: clientX,
          y: clientY,
          scrollX,
          scrollY,
        })
      }
    },
    [socket, isConnected, pageId],
  )

  return {
    socket,
    isConnected,
    roomUsers,
    users,
    emitBlockUpdate,
    emitOrderChange,
    emitMouseMove,
  }
}
