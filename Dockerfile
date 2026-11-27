FROM node:24.22.1-bookworm-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS node-base
RUN npm install --global --ignore-scripts npm@12.2.1

FROM node-base AS workspace
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

FROM workspace AS build
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY apps/web/index.html apps/web/tsconfig.json apps/web/vite.config.ts ./apps/web/
COPY apps/web/src ./apps/web/src
COPY packages/shared-types/tsconfig.json ./packages/shared-types/
COPY packages/shared-types/src ./packages/shared-types/src
RUN npm run build

FROM workspace AS production-dependencies
RUN npm ci --omit=dev --ignore-scripts --workspace @messaging-app/api --workspace @messaging-app/shared-types

FROM node-base AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/apps/api ./apps/api
COPY --from=production-dependencies /app/packages/shared-types ./packages/shared-types
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/server.js"]

FROM nginx:1.30.8-alpine@sha256:8eb04fe3b385090e9aa02961f77398ad09b6bf33ab07f6669a5bb7acce22c0d3 AS nginx
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
