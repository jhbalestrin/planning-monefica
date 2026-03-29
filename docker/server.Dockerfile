FROM node:22-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared-types packages/shared-types
COPY packages/server packages/server

RUN npm ci \
  && npm run build -w @planning-monefica/shared-types \
  && npm run build -w @planning-monefica/server \
  && npm prune --omit=dev

FROM node:22-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist

WORKDIR /app/packages/server
EXPOSE 5555
CMD ["node", "dist/main.js"]
