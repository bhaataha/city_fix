# ──────────────────────────────────────
# CityFix API — Production Dockerfile
# Multi-stage build for NestJS
# ──────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Copy everything needed
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

# Install ALL deps (unset NODE_ENV to prevent skipping devDeps)
RUN NODE_ENV=development pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/packages/database
RUN pnpm exec prisma generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy built output and node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma

USER nestjs
EXPOSE 4100

CMD ["node", "dist/main.js"]
