FROM node:22-alpine

WORKDIR /app

# Install build dependencies and OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl openssl-dev libc6-compat python3 make g++

# Install pnpm
RUN npm install -g pnpm@9

# Copy root configurations and workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/application/package.json ./packages/application/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/domain/package.json ./packages/domain/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/shared-kernel/package.json ./packages/shared-kernel/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full source code
COPY . .

# Generate Prisma Client
RUN pnpm run db:generate --filter=@aquasystem/api

EXPOSE 3030

# Run migrations, seed if needed, and start API
CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && npx tsx --tsconfig ../../tsconfig.json prisma/seed.ts && pnpm run dev"]
