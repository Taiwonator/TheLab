'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function SocketTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // Initialize the socket connection
    const socketInit = async () => {
      try {
        // Connect to the Socket.io server using the environment variable
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001'
        const socket = io(socketServerUrl, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling'],
          autoConnect: true,
        })

        socket.on('connect', () => {
          setIsConnected(true)
          setMessages((prev) => [...prev, `Connected with ID: ${socket.id}`])

          // Join a test room
          socket.emit('join-page', 'test-page')
        })

        socket.on('disconnect', () => {
          setIsConnected(false)
          setMessages((prev) => [...prev, 'Disconnected'])
        })

        socket.on('connect_error', (err) => {
          setMessages((prev) => [...prev, `Connection error: ${err.message}`])
        })

        // Listen for test messages
        socket.on('blocks-updated', (data) => {
          setMessages((prev) => [...prev, `Received blocks update: ${JSON.stringify(data)}`])
        })

        // Clean up on unmount
        return () => {
          socket.disconnect()
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        ])
      }
    }

    socketInit()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Socket.io Test</h1>
      <div className="mb-4">
        <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      </div>
      <div className="border p-4 rounded-md bg-gray-100 h-64 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Messages:</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index} className="mb-1">
              {message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
