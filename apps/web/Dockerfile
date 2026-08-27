# Multi-stage Dockerfile for AquaPure Pro Production
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy root configurations and workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/application/package.json ./packages/application/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/domain/package.json ./packages/domain/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/shared-kernel/package.json ./packages/shared-kernel/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full source code
COPY . .

# Build application
RUN pnpm --filter=@aquasystem/web build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy output from builder
COPY --from=builder /app/apps/web/.output ./

# Secure non-root user
RUN addgroup -g 1001 -S aquagroup && \
    adduser -S aquauser -u 1001 -G aquagroup && \
    chown -R aquauser:aquagroup /app

USER aquauser

EXPOSE 3000

CMD ["node", "server/index.mjs"]
