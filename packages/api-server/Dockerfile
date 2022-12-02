# Build stage.
FROM node:18-alpine AS builder

WORKDIR /app/packages/api-server

# Install dependencies.
RUN npm install -g pnpm
COPY ./packages/api-server/pnpm-lock.yaml ./packages/api-server/package.json ./
RUN pnpm fetch
RUN pnpm install -r --offline

# Copy source code.
COPY ./packages/api-server/tsconfig.json .
COPY ./packages/api-server/src/  ./src

# Build.
RUN pnpm run build:ts

# Clean up dev dependencies.
RUN pnpm prune --production --config.ignore-scripts=true

# Runtime stage.
FROM node:18-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app/packages/api-server

COPY --from=builder /app/packages/api-server  .

# Copy the configs dir.
COPY ./configs /app/configs

EXPOSE 3450

CMD ["npm", "run", "start"]
