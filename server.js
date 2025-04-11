import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

console.log('from server: ', process.env.NODE_ENV)

const dev = process.env.NODE_ENV !== 'production'

console.log('isDev: ', dev)

const app = next({ dev: false })
const handle = app.getRequestHandler()

// Store connected clients by pageId
// const pageClients = new Map()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Store connected clients by pageId
  const pageClients = new Map()

  // Store user data (icon and color) by socket ID
  const userData = new Map()

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

  // Array of colors for user icons
  const COLORS = [
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

  // Function to get user data for a room
  function getRoomUsers(pageId) {
    const users = []
    if (pageClients.has(pageId)) {
      for (const socketId of pageClients.get(pageId)) {
        if (userData.has(socketId)) {
          users.push({
            id: socketId,
            ...userData.get(socketId),
          })
        }
      }
    }
    return users
  }

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

      // Assign a random icon and color to the user if they don't have one yet
      if (!userData.has(socket.id)) {
        const iconIndex = Math.floor(Math.random() * CUTE_ICONS.length)
        const colorIndex = Math.floor(Math.random() * COLORS.length)
        userData.set(socket.id, {
          icon: CUTE_ICONS[iconIndex],
          color: COLORS[colorIndex],
          cursor: { x: 0, y: 0 },
        })
      }

      // Get all users in the room with their data
      const users = getRoomUsers(pageId)

      // Emit updated user list to all clients in the room
      io.to(pageId).emit('room-users-updated', { users, count: users.length })
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

    // Handle mouse movements
    socket.on('mouse-move', (data) => {
      // Update the user's cursor position
      if (userData.has(socket.id)) {
        const user = userData.get(socket.id)
        user.cursor = {
          x: data.x,
          y: data.y,
          scrollX: data.scrollX || 0,
          scrollY: data.scrollY || 0,
        }
        userData.set(socket.id, user)
      }

      // Broadcast the mouse movement to all clients in the room except the sender
      socket.to(data.pageId).emit('cursor-updated', {
        id: socket.id,
        x: data.x,
        y: data.y,
        scrollX: data.scrollX || 0,
        scrollY: data.scrollY || 0,
        icon: userData.get(socket.id)?.icon,
        color: userData.get(socket.id)?.color,
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Remove client from all page clients maps
      for (const [pageId, clients] of pageClients.entries()) {
        if (clients.has(socket.id)) {
          clients.delete(socket.id)

          // Get all users in the room with their data
          const users = getRoomUsers(pageId)

          // Emit updated user list to all clients in the room
          io.to(pageId).emit('room-users-updated', { users, count: users.length })

          if (clients.size === 0) {
            pageClients.delete(pageId)
          }
        }
      }

      // Remove user data
      userData.delete(socket.id)
    })
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
