FROM node:22-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared-types packages/shared-types
COPY packages/control-pane packages/control-pane

RUN npm ci \
  && npm run build -w @planning-monefica/shared-types \
  && npm run build -w @planning-monefica/control-pane

FROM nginx:alpine
COPY docker/nginx-spa-api-proxy.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/control-pane/build /usr/share/nginx/html
EXPOSE 80
