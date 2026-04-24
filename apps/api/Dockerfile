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
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

# Install ALL deps (unset NODE_ENV to prevent skipping devDeps)
RUN NODE_ENV=development pnpm install --frozen-lockfile

# Generate Prisma Client and Build
WORKDIR /app/packages/database
RUN pnpm exec prisma generate

WORKDIR /app
RUN pnpm build

# Deploy the API to a standalone folder
RUN pnpm --filter @cityfix/api deploy --prod /deploy

# Generate Prisma Client in the deployed folder
WORKDIR /deploy/node_modules/@cityfix/database
RUN npx prisma@6 generate
# Stage 2: Production
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy deployed output
COPY --from=builder --chown=nestjs:nestjs /deploy ./

USER nestjs
EXPOSE 4100

CMD ["sh", "-c", "cd node_modules/@cityfix/database && npx prisma@6 db push --accept-data-loss && cd ../../../ && node dist/main.js"]
