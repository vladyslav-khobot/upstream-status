# Build context is the repo root:
#   docker build -f apps/web/Dockerfile .
FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @upstream/web --include-workspace-root=false

COPY tsconfig.base.json ./
COPY apps/web apps/web

# Vite inlines VITE_* variables into the bundle at build time.
ARG VITE_ADMIN_TOKEN
ENV VITE_ADMIN_TOKEN=$VITE_ADMIN_TOKEN
RUN npm run build -w @upstream/web

FROM nginx:1.29-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
