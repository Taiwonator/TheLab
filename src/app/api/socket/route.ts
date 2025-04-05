import { Server as NetServer } from 'http'
import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'

// Global variable to store the Socket.io server instance
let io: ServerIO

// Store connected clients by pageId
const pageClients = new Map<string, Set<string>>()

export async function GET(req: NextRequest) {
  // Get the server instance from the global object
  const res = new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })

  // Get the server instance from the global object
  const httpServer: NetServer = (res as any).socket?.server

  // If the Socket.io server is already running, return
  if (io) {
    console.log('Socket.io server already running')
    return res
  }

  // Create a new Socket.io server
  io = new ServerIO(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Set up event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join a room for the specific page
    socket.on('join-page', (pageId) => {
      console.log(`Socket ${socket.id} joined room: ${pageId}`)
      socket.join(pageId)

      // Add client to the page clients map
      if (!pageClients.has(pageId)) {
        pageClients.set(pageId, new Set())
      }
      pageClients.get(pageId)?.add(socket.id)
    })

    // Handle block updates
    socket.on('update-blocks', (data) => {
      console.log(`Received update for page ${data.pageId}`)
      // Broadcast the update to all clients in the room except the sender
      socket.to(data.pageId).emit('blocks-updated', data)
    })

    // Handle order changes
    socket.on('order-changed', (data) => {
      console.log(`Order changed for page ${data.pageId}`)
      // Broadcast the order change to all clients in the room except the sender
      socket.to(data.pageId).emit('order-updated', data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Remove client from all page clients maps
      for (const [pageId, clients] of pageClients.entries()) {
        if (clients.has(socket.id)) {
          clients.delete(socket.id)
          if (clients.size === 0) {
            pageClients.delete(pageId)
          }
        }
      }
    })
  })

  console.log('Socket.io server started')
  return res
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
