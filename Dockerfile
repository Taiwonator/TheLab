FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build arguments
ARG MONGODB_URI
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SOCKET_SERVER_URL

# Set environment variables
ENV MONGODB_URI=$MONGODB_URI
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV NEXT_PUBLIC_SOCKET_SERVER_URL=$NEXT_PUBLIC_SOCKET_SERVER_URL

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create media directory and set permissions
# RUN mkdir -p /app/media && chmod 777 /app/media

# Copy built application
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs


# Set ownership for all copied files
RUN chown -R nextjs:nodejs .

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
