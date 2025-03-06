# Use Node.js LTS image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application code
COPY . .

# Generate RSA keys
RUN yarn generate-keys

# Build TypeScript code
RUN yarn build

# Generate Prisma Client for the correct architecture
RUN yarn prisma generate

# Use a smaller runtime image for production
FROM node:22-alpine

# Install runtime dependencies for Argon2
RUN apk add --no-cache curl python3 make g++

# Set working directory
WORKDIR /app

# Copy built files and node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/keys ./keys
COPY --from=builder /app/scripts ./scripts

# Expose the application port
EXPOSE 4000