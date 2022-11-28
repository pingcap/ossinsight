# Build stage.
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies.
RUN npm install -g pnpm
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch
RUN pnpm install -r --offline

# Copy source code.
COPY tsconfig.json .
COPY src/  ./src

# Build.
RUN pnpm run build:ts

# Clean up dev dependencies.
RUN pnpm prune --production --config.ignore-scripts=true

# Runtime stage.
FROM node:18-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app  .

EXPOSE 3450

CMD ["npm", "run", "start"]