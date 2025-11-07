# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# Build toolchain for native dependencies (pg-native if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*

# Install deps with lockfile
COPY package.json package-lock.json* ./
RUN npm ci

# Copy config and sources
COPY tsconfig.json ./
COPY esbuild.config.mjs ./
COPY vitest.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Compile TypeScript with esbuild -> dist
RUN npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runner
WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV PORT=3005

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs \
  && chown -R nodejs:nodejs /app

# Copy build artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

# Change to non-root user
USER nodejs

# Exposed port
EXPOSE 3005

# ----- App startup -----
CMD ["sh", "-lc", "node dist/scripts/migrate.js && (node dist/scripts/seed.js || true) && node dist/server.js"]