# Deployment Guide

This document provides instructions for deploying the application both locally using Docker Compose and to Northflank for production.

## Table of Contents

- [Local Deployment with Docker Compose](#local-deployment-with-docker-compose)
- [Production Deployment to Northflank](#production-deployment-to-northflank)
  - [Setting Up Northflank](#setting-up-northflank)
  - [Deploying the Services](#deploying-the-services)
  - [Environment Variables](#environment-variables)
  - [Connecting the Services](#connecting-the-services)

## Local Deployment with Docker Compose

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git repository cloned locally

### Steps

1. **Create a .env file**

   Copy the example environment file and update the values as needed:

   ```bash
   cp .env.example .env
   ```

2. **Build and start the containers**

   ```bash
   docker-compose up --build
   ```

   This will start three services:
   - MongoDB database (`mongo`)
   - Next.js application (`nextjs`)
   - Socket.io server (`socketio`)

3. **Access the application**

   - Next.js application: http://localhost:3000
   - Socket.io server: http://localhost:3001

4. **Stop the containers**

   ```bash
   docker-compose down
   ```

## Production Deployment to Northflank

### Setting Up Northflank

1. **Create a Northflank account**

   Sign up at [Northflank](https://northflank.com/) if you don't have an account.

2. **Create a new project**

   Create a new project in Northflank to host your services.

### Deploying the Services

#### Option 1: Using Northflank Workflows (Recommended)

1. **Connect your Git repository**

   Connect your Git repository to Northflank.

2. **Create a workflow**

   Create a new workflow with the following steps:
   - Build the Docker images
   - Deploy the services

3. **Configure the workflow**

   Use the following configuration:

   ```yaml
   version: 1
   steps:
     - name: Build Next.js Image
       type: build
       dockerfile: Dockerfile
       registry: northflank
       image: nextjs-app
       tag: latest
     
     - name: Build Socket.io Image
       type: build
       dockerfile: Dockerfile.socket
       registry: northflank
       image: socketio-server
       tag: latest
     
     - name: Deploy MongoDB
       type: deploy
       service: mongo
       image: mongo:latest
       ports:
         - port: 27017
           protocol: tcp
       volumes:
         - name: mongo-data
           mountPath: /data/db
       env:
         - name: MONGO_INITDB_ROOT_USERNAME
           value: $MONGO_USERNAME
         - name: MONGO_INITDB_ROOT_PASSWORD
           value: $MONGO_PASSWORD
     
     - name: Deploy Next.js
       type: deploy
       service: nextjs
       image: $REGISTRY/nextjs-app:latest
       ports:
         - port: 3000
           protocol: http
       env:
         - name: NODE_ENV
           value: production
         - name: MONGODB_URI
           value: mongodb://$MONGO_USERNAME:$MONGO_PASSWORD@mongo:27017/mockpages?authSource=admin
         - name: PAYLOAD_SECRET
           value: $PAYLOAD_SECRET
         - name: PAYLOAD_PUBLIC_SERVER_URL
           value: $PAYLOAD_PUBLIC_SERVER_URL
         - name: NEXT_PUBLIC_SERVER_URL
           value: $NEXT_PUBLIC_SERVER_URL
         - name: NEXT_PUBLIC_SOCKET_SERVER_URL
           value: $NEXT_PUBLIC_SOCKET_SERVER_URL
     
     - name: Deploy Socket.io
       type: deploy
       service: socketio
       image: $REGISTRY/socketio-server:latest
       ports:
         - port: 3001
           protocol: http
       env:
         - name: NODE_ENV
           value: production
         - name: CORS_ORIGIN
           value: $CORS_ORIGIN
   ```

#### Option 2: Manual Deployment

1. **Create a MongoDB service**

   - Create a new service using the MongoDB image
   - Configure the environment variables:
     - `MONGO_INITDB_ROOT_USERNAME`: Your MongoDB username
     - `MONGO_INITDB_ROOT_PASSWORD`: Your MongoDB password
   - Add a persistent volume for `/data/db`

2. **Create a Next.js service**

   - Create a new service using your Git repository
   - Set the Dockerfile path to `Dockerfile`
   - Configure the environment variables (see [Environment Variables](#environment-variables))
   - Set the port to 3000

3. **Create a Socket.io service**

   - Create a new service using your Git repository
   - Set the Dockerfile path to `Dockerfile.socket`
   - Configure the environment variables (see [Environment Variables](#environment-variables))
   - Set the port to 3001

### Environment Variables

Set the following environment variables in Northflank:

#### MongoDB Service
- `MONGO_INITDB_ROOT_USERNAME`: Your MongoDB username
- `MONGO_INITDB_ROOT_PASSWORD`: Your MongoDB password

#### Next.js Service
- `NODE_ENV`: `production`
- `MONGODB_URI`: `mongodb://username:password@mongo:27017/mockpages?authSource=admin`
- `PAYLOAD_SECRET`: A secure random string
- `PAYLOAD_PUBLIC_SERVER_URL`: The URL of your Next.js service
- `NEXT_PUBLIC_SERVER_URL`: The URL of your Next.js service
- `NEXT_PUBLIC_SOCKET_SERVER_URL`: The URL of your Socket.io service

#### Socket.io Service
- `NODE_ENV`: `production`
- `CORS_ORIGIN`: The URL of your Next.js service

### Connecting the Services

1. **Create a network**

   Create a network in Northflank to connect your services.

2. **Add services to the network**

   Add all three services to the network.

3. **Configure DNS**

   Ensure that the services can communicate with each other using their service names.

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**

   Make sure the MongoDB service is running and the connection string is correct.

2. **Socket.io connection issues**

   Check that the CORS settings are correct and the Socket.io server is accessible from the client.

3. **Next.js build failures**

   Check the build logs for errors and ensure all dependencies are installed correctly.

### Getting Help

If you encounter any issues, check the logs in Northflank or Docker Compose for more information.
