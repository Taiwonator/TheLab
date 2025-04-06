import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
// import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Store connected clients by pageId
// const pageClients = new Map()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // // Initialize Socket.io
  // const io = new Server(server, {
  //   cors: {
  //     origin: '*',
  //     methods: ['GET', 'POST'],
  //   },
  // })

  // // Set up event handlers
  // io.on('connection', (socket) => {
  //   console.log('Client connected:', socket.id)

  //   // Join a room for the specific page
  //   socket.on('join-page', (pageId) => {
  //     console.log(`Socket ${socket.id} joined room: ${pageId}`)
  //     socket.join(pageId)

  //     // Add client to the page clients map
  //     if (!pageClients.has(pageId)) {
  //       pageClients.set(pageId, new Set())
  //     }
  //     pageClients.get(pageId).add(socket.id)
  //   })

  //   // Handle block updates
  //   socket.on('update-blocks', (data) => {
  //     console.log(`Received update for page ${data.pageId}`)
  //     // Broadcast the update to all clients in the room except the sender
  //     socket.to(data.pageId).emit('blocks-updated', data)
  //   })

  //   // Handle order changes
  //   socket.on('order-changed', (data) => {
  //     console.log(`Order changed for page ${data.pageId}`)
  //     // Broadcast the order change to all clients in the room except the sender
  //     socket.to(data.pageId).emit('order-updated', data)
  //   })

  //   // Handle disconnection
  //   socket.on('disconnect', () => {
  //     console.log('Client disconnected:', socket.id)

  //     // Remove client from all page clients maps
  //     for (const [pageId, clients] of pageClients.entries()) {
  //       if (clients.has(socket.id)) {
  //         clients.delete(socket.id)
  //         if (clients.size === 0) {
  //           pageClients.delete(pageId)
  //         }
  //       }
  //     }
  //   })
  // })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
