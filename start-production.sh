#!/bin/bash

# Start the Socket.io server in the background
echo "Starting Socket.io server..."
node socket-server.js &
SOCKET_PID=$!

# Start the Next.js application
echo "Starting Next.js application..."
npm run start

# When Next.js exits, kill the Socket.io server
kill $SOCKET_PID
