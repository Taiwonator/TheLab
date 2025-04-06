#!/bin/sh

# Generate a random secret for build time if not provided
BUILD_SECRET=${PAYLOAD_SECRET:-$(openssl rand -base64 32)}

# Build the Docker image with the secret
docker build \
  --build-arg PAYLOAD_SECRET="${BUILD_SECRET}" \
  -t mock-pages-app .

# Show the build result
echo "Docker build completed with exit code $?"
