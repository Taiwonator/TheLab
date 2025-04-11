#!/bin/sh

# Load environment variables from .env file
set -a
source .env
set +a

# Build the Docker image with environment variables
docker build \
  --build-arg MONGODB_URI="${MONGODB_URI}" \
  --build-arg PAYLOAD_SECRET="${PAYLOAD_SECRET}" \
  --build-arg NEXT_PUBLIC_SOCKET_SERVER_URL="${NEXT_PUBLIC_SOCKET_SERVER_URL}" \
  -t server .

# Show the build result
echo "Docker build completed with exit code $?"
