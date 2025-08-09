# syntax=docker/dockerfile:1

# Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install

# Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prepare Prisma (SQLite) at build time so the image includes a ready DB and client
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
# If migrations are present, deploy them (won't fail the build if not configured)
RUN npx prisma migrate deploy || true
RUN npm run build

# Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Default SQLite path inside the image (override via env if desired)
ENV DATABASE_URL="file:./dev.db"

# Copy Next.js standalone output and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Include Prisma schema/migrations and the generated DB if created at build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dev.db ./dev.db

EXPOSE 3000
CMD ["node", "server.js"]
