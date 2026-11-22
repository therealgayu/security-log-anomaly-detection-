# ==============================================================================
# Security Log Anomaly Detection System (NIIT University Capstone II)
# Frontend React SPA Dockerfile (Multi-stage Build: Node.js 18 -> Nginx Alpine)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build production static distribution bundle
# ------------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Accept build arguments for environment variables embedded by Vite at build time
ARG VITE_API_URL=https://localhost/api
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy dependency manifests
COPY package*.json ./

# Install exact dependencies
RUN npm ci

# Copy frontend source code and configuration files
COPY . .

# Compile and bundle static assets into /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve compiled assets with lightweight Nginx web server
# ------------------------------------------------------------------------------
FROM nginx:alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution files from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port inside container network
EXPOSE 80

# Healthcheck verifying Nginx is responding on port 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
