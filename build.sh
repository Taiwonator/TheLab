#!/bin/bash

# Build the Docker image
docker build -t mock-pages-app .

# Show the build result
echo "Docker build completed with exit code $?"
