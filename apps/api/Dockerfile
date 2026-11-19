# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t 4kidstudy-api .
# Run migrations, then the server:
#   docker run --rm --env-file apps/api/.env 4kidstudy-api node_modules/.bin/prisma migrate deploy
#   docker run --env-file apps/api/.env -p 3001:3001 4kidstudy-api
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Prisma picks its query engine from the OpenSSL version present at generate time.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && corepack enable
WORKDIR /repo

# 1. Reduce the monorepo to @4kidstudy/api and its workspace dependencies.
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.11.11 prune @4kidstudy/api --docker

# 2. Install (cached on lockfile + manifests), build, and produce a standalone
#    production node_modules for the API.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
# postinstall runs `prisma generate`, which needs the schema.
COPY --from=pruner /repo/out/full/apps/api/prisma ./apps/api/prisma
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@4kidstudy/api
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter=@4kidstudy/api deploy --prod --legacy /prod/api \
 && cd /prod/api \
 && ./node_modules/.bin/prisma generate

# 3. Runtime image.
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app
COPY --from=builder --chown=node:node /prod/api ./
COPY --from=builder --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
