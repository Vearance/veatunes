# ---- Base ----
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NAVIDROME_URL is required at build time by next.config.ts
ARG NAVIDROME_URL
ENV NAVIDROME_URL=${NAVIDROME_URL}

# NEXT_PUBLIC_* vars are inlined into the client JS bundle at build time
ARG NEXT_PUBLIC_NAVIDROME_URL
ARG NEXT_PUBLIC_NAVIDROME_USER
ARG NEXT_PUBLIC_NAVIDROME_PASSWORD
ENV NEXT_PUBLIC_NAVIDROME_URL=${NEXT_PUBLIC_NAVIDROME_URL}
ENV NEXT_PUBLIC_NAVIDROME_USER=${NEXT_PUBLIC_NAVIDROME_USER}
ENV NEXT_PUBLIC_NAVIDROME_PASSWORD=${NEXT_PUBLIC_NAVIDROME_PASSWORD}

RUN bun run build

# ---- Runner ----
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["bun", "server.js"]
