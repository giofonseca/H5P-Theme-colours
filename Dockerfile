# Build Stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY . .

# Build the React frontend
RUN npm run build

# Production Stage
FROM node:22-slim

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy the server source (since we're using tsx to run it)
COPY --from=builder /app/server.ts ./server.ts

# Expose the port
EXPOSE 3000

# Start the application using tsx
CMD ["npm", "start"]
