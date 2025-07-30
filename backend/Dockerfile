# Use a lightweight Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy backend source code
COPY . .

# Set environment variables (override in production)
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]