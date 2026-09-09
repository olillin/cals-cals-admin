ARG NODE_VERSION=24.19.0

FROM node:${NODE_VERSION}-alpine AS base

ARG PRISMA_VERSION=7.10.0
ARG WEB_VERSION

# Set working directory
WORKDIR /app

# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

FROM base AS dependencies

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile;

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM base AS builder

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Generate the Prisma client
RUN corepack enable pnpm && pnpm exec prisma generate

ENV NODE_ENV=production

# Make version available as an environment variable
ENV NEXT_PUBLIC_WEB_VERSION=${WEB_VERSION}

# Disable Next.js anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Skip environment validation to prevent errors caused by required environment
# variables. Read more: https://create.t3.gg/en/deployment/docker
ENV SKIP_ENV_VALIDATION=1

# Build Next.js application
# If you want to speed up Docker rebuilds, you can cache the build artifacts
# by adding: --mount=type=cache,target=/app/.next/cache
# This caches the .next/cache directory across builds, but it also prevents
# .next/cache/fetch-cache from being included in the final image, meaning
# cached fetch responses from the build won't be available at runtime.
RUN --mount=type=cache,target=/app/.next/cache \
    corepack enable pnpm && pnpm build;

# Setup Prisma environment

# Remove dotenv import from prisma.config.ts
RUN sed -i '/dotenv\/config/d' prisma.config.ts

WORKDIR .next/standalone
RUN mkdir prisma-cli

# Copy Prisma, "type" and "devEngines" in package.json
RUN apk add jq
RUN jq '{type, dependencies: (.dependencies | {prisma}), devEngines}' package.json > prisma-cli/package.json

WORKDIR prisma-cli

COPY pnpm-lock.yaml pnpm-workspace.yaml .
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install;

RUN cp -r /app/prisma ./prisma
RUN cp /app/prisma.config.ts ./prisma.config.ts

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM base AS runner

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV PRISMA_VERSION=${PRISMA_VERSION}

# Disable Next.js anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./

# If you want to persist the fetch cache generated during the build so that
# cached responses are available immediately on startup, uncomment this line:
# COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Start Next.js standalone server
CMD ["/bin/sh", "-c", "cd prisma-cli && npx prisma migrate deploy && cd .. && node server.js"]
