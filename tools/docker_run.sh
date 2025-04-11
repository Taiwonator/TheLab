#!/bin/sh

# Load environment variables from .env file
set -a
source .env
set +a

# Build the Docker image with environment variables
docker run -p 3000:3000 -it \
  -v payload-media:/app/media \
  --env MONGODB_URI="${MONGODB_URI}" \
  --env PAYLOAD_SECRET="${PAYLOAD_SECRET}" \
  --env NEXT_PUBLIC_SOCKET_SERVER_URL="${NEXT_PUBLIC_SOCKET_SERVER_URL}" \
  server

# Show the build result
echo "Docker run completed with exit code $?"
