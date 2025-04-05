# Deployment Guide for Northflank

This guide provides instructions for deploying the application to Northflank.

## Prerequisites

1. A Northflank account
2. Docker installed on your local machine (for testing)
3. Git repository with your code

## Deployment Steps

### 1. Build and Test the Docker Image Locally (Optional)

Before deploying to Northflank, you can build and test the Docker image locally:

```bash
# Build the Docker image
docker build -t mock-pages-app .

# Run the Docker container
docker run -p 3000:3000 -p 3001:3001 mock-pages-app
```

Visit http://localhost:3000 to verify that the application is working correctly.

### 2. Deploy to Northflank

#### Option 1: Deploy using the Northflank UI

1. Log in to your Northflank account
2. Create a new project or select an existing one
3. Create a new service:
   - Select "Deploy from Git repository"
   - Connect your Git repository
   - Select the branch you want to deploy
   - Choose "Dockerfile" as the build method
   - Configure the following settings:
     - Port: 3000 (for the Next.js application)
     - Additional port: 3001 (for the Socket.io server)
   - Set the following environment variables:
     - `NODE_ENV`: `production`
     - `SOCKET_SERVER_PORT`: `3001`
     - `NEXT_PUBLIC_SOCKET_SERVER_URL`: The URL of your Socket.io server (e.g., `https://your-app-domain.com`)
   - Configure any other settings as needed (resources, scaling, etc.)
4. Click "Create Service" to deploy the application

#### Option 2: Deploy using the Northflank CLI

1. Install the Northflank CLI:
   ```bash
   npm install -g northflank-cli
   ```

2. Log in to your Northflank account:
   ```bash
   northflank login
   ```

3. Create a new project (if needed):
   ```bash
   northflank projects create --name "Mock Pages App"
   ```

4. Deploy the application:
   ```bash
   northflank services create \
     --project "Mock Pages App" \
     --name "mock-pages-app" \
     --git-repo "your-git-repo-url" \
     --git-branch "main" \
     --build-method "dockerfile" \
     --port 3000 \
     --additional-port 3001 \
     --env NODE_ENV=production \
     --env SOCKET_SERVER_PORT=3001 \
     --env NEXT_PUBLIC_SOCKET_SERVER_URL="https://your-app-domain.com"
   ```

### 3. Configure Domain and SSL

1. In the Northflank UI, go to your service
2. Navigate to the "Domains" tab
3. Add your custom domain
4. Configure SSL settings

### 4. Verify Deployment

1. Visit your application's URL to verify that it's working correctly
2. Test the real-time functionality to ensure that the Socket.io server is working

## Environment Variables

The following environment variables are used in the application:

- `NODE_ENV`: The environment mode (should be set to `production` for production deployments)
- `SOCKET_SERVER_PORT`: The port for the Socket.io server (default: 3001)
- `NEXT_PUBLIC_SOCKET_SERVER_URL`: The URL of the Socket.io server (leave empty to use the same domain as the Next.js application)

## Troubleshooting

If you encounter any issues with the deployment, check the following:

1. Logs: Check the service logs in the Northflank UI for any errors
2. Environment variables: Ensure that all required environment variables are set correctly
3. Ports: Verify that the ports are configured correctly (3000 for Next.js, 3001 for Socket.io)
4. Network: Make sure that the Socket.io server can communicate with the Next.js application

## Scaling

If you need to scale your application, you can configure the following in the Northflank UI:

1. Horizontal scaling: Increase the number of instances
2. Vertical scaling: Increase the resources (CPU, memory) for each instance

Note that when scaling horizontally, you'll need to ensure that the Socket.io server can handle multiple instances. You may need to use a Redis adapter for Socket.io to enable communication between instances.
