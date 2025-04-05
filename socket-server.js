import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Store connected clients by pageId
const pageClients = new Map()

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
    pageClients.get(pageId).add(socket.id)
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

// Start the server
const PORT = process.env.SOCKET_SERVER_PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
