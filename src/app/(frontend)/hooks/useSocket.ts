import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface BlockData {
  blocks: any[]
  [key: string]: any
}

export function useSocket(pageId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let socketInstance: Socket

    // Initialize the socket connection
    const socketInit = async () => {
      try {
        // Connect to the standalone Socket.io server
        socketInstance = io('http://localhost:3001', {
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

        setSocket(socketInstance)
      } catch (error) {
        console.error('Error initializing socket:', error)
      }
    }

    socketInit()

    // Clean up on unmount
    return () => {
      if (socketInstance) {
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

  return {
    socket,
    isConnected,
    emitBlockUpdate,
    emitOrderChange,
  }
}
