FROM node:22-bookworm AS builder
WORKDIR /app

ARG EXPO_PUBLIC_TENANT_ID=
ARG EXPO_PUBLIC_DEV_ACCESS_TOKEN=

# Relative /api — nginx proxies to Nest (same pattern as Vite dev proxy).
ENV EXPO_PUBLIC_API_BASE_URL=
ENV EXPO_PUBLIC_TENANT_ID=$EXPO_PUBLIC_TENANT_ID
ENV EXPO_PUBLIC_DEV_ACCESS_TOKEN=$EXPO_PUBLIC_DEV_ACCESS_TOKEN

COPY package.json package-lock.json ./
COPY packages/shared-types packages/shared-types
COPY packages/ic-app packages/ic-app

RUN npm ci \
  && npm run build -w @planning-monefica/shared-types \
  && cd packages/ic-app \
  && npx expo export --platform web

FROM nginx:alpine
COPY docker/nginx-spa-api-proxy.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/ic-app/dist /usr/share/nginx/html
EXPOSE 80
