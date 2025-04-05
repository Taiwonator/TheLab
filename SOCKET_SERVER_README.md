# Socket.io Server Setup

This document provides instructions for setting up the Socket.io server for real-time updates in your application.

## Development Setup

In development, the Socket.io server runs on a separate port (default: 3001) from your Next.js application.

1. Create a `.env.local` file in the root of your project with the following content:

```
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
SOCKET_SERVER_PORT=3001
```

2. Start the Socket.io server:

```bash
node socket-server.js
```

3. Start your Next.js application:

```bash
npm run dev
```

## Production Setup

In production, you have several options for deploying the Socket.io server:

### Option 1: Same Domain, Different Port

1. Create a `.env.production` file in the root of your project with the following content:

```
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-domain.com:3001
SOCKET_SERVER_PORT=3001
```

2. Make sure your server allows connections on port 3001 and configure your reverse proxy (Nginx, Apache, etc.) to forward WebSocket connections to this port.

### Option 2: Subdomain

1. Create a `.env.production` file in the root of your project with the following content:

```
NEXT_PUBLIC_SOCKET_SERVER_URL=https://socket.your-domain.com
SOCKET_SERVER_PORT=3001
```

2. Configure your DNS to point the subdomain to your server.
3. Configure your reverse proxy to forward requests to the subdomain to the Socket.io server.

### Option 3: Separate Server

1. Deploy the Socket.io server to a separate server.
2. Create a `.env.production` file in the root of your project with the following content:

```
NEXT_PUBLIC_SOCKET_SERVER_URL=https://your-socket-server.com
SOCKET_SERVER_PORT=3001
```

## Nginx Configuration Example

Here's an example Nginx configuration for option 1 (same domain, different port):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 3001 ssl;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Socket.io server
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

For option 2 (subdomain), use this configuration:

```nginx
server {
    listen 80;
    server_name socket.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name socket.your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Socket.io server
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## CORS Configuration

If you're using a different domain or subdomain for your Socket.io server, you'll need to configure CORS. The Socket.io server is already configured to accept connections from any origin, but you can restrict it by modifying the CORS configuration in `socket-server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: "https://your-domain.com",
    methods: ["GET", "POST"],
  },
});
```

## Troubleshooting

If you're experiencing connection issues:

1. Check that the Socket.io server is running.
2. Verify that the environment variables are set correctly.
3. Check your browser's console for any connection errors.
4. Ensure that your firewall or proxy is not blocking WebSocket connections.
5. If using HTTPS, make sure your SSL certificates are valid.

## Security Considerations

In a production environment, consider implementing authentication for Socket.io connections to prevent unauthorized access. You can use JWT tokens or other authentication mechanisms to secure your Socket.io server.
