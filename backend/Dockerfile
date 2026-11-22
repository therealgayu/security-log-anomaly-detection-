# ==============================================================================
# Security Log Anomaly Detection System (NIIT University Capstone II)
# Backend Microservice Dockerfile (Node.js 18 LTS on Alpine Linux)
# ==============================================================================

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install curl for reliable container health checking
RUN apk add --no-cache curl

# Copy dependency manifests first for optimal layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set default runtime environment variables
ENV NODE_ENV=production \
    PORT=5000

# Expose backend internal HTTP port
EXPOSE 5000

# Container healthcheck querying the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Node.js production server
CMD ["node", "src/server.js"]
