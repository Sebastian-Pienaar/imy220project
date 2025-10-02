
# Use Node.js 18 LTS
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies (this includes both frontend and backend deps)
RUN npm install

# Copy source code
COPY . .

# Build the frontend for production
RUN npm run build

# Expose port 8000 (used by server-static.js)
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start the production server (serves both frontend and backend)
CMD ["node", "server-static.js"]