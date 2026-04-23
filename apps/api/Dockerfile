# ──────────────────────────────────────
# CityFix API — Production Dockerfile
# Multi-stage build for NestJS
# ──────────────────────────────────────

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/api ./apps/api
COPY tsconfig.base.json ./

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Stage 3: Production
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
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./prisma

USER nestjs
EXPOSE 4100

CMD ["node", "dist/main.js"]
