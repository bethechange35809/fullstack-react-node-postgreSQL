FROM node:20-alpine

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5050

# Start server
CMD ["node", "index.js"]
