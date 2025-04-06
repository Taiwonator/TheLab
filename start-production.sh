#!/bin/sh

# Start the combined Next.js and Socket.io server
echo "Starting server..."
NODE_ENV=production HOSTNAME="0.0.0.0" node server.js