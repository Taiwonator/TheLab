#!/bin/bash

# Start the Socket.io server in the background
echo "Starting Socket.io server..."
node socket-server.js &
SOCKET_PID=$!

# Start the Next.js application
echo "Starting Next.js application..."
HOSTNAME="0.0.0.0" node server.js &
NEXT_PID=$!

# Handle termination signals
trap "kill $SOCKET_PID $NEXT_PID; exit" SIGINT SIGTERM

# Keep the script running
wait $NEXT_PID
kill $SOCKET_PID
