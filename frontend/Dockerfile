# Step 1: Build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files first for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all other source files
COPY . .

# Build the app
RUN npm run build

# Step 2: Serve the build using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app to Nginx static folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]