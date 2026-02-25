FROM node:22-slim

# Install system dependencies for Chromium/Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
  libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 \
  chromium ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy ALL source files first (including patches directory needed by pnpm)
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application (Vite frontend + esbuild backend)
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
