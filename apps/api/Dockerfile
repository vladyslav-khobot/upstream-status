# Build context is the repo root (npm workspaces share one lockfile):
#   docker build -f apps/api/Dockerfile .
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Manifests first, so the dependency layer is reused when only source code changes.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --omit=dev --workspace @upstream/api --include-workspace-root=false

COPY apps/api/src apps/api/src

WORKDIR /app/apps/api
USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3001/api/healthz || exit 1

# Node runs TypeScript directly (type stripping), so there is no build step.
CMD ["node", "src/server.ts"]
