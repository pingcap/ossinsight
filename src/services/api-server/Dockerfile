FROM node:20-alpine AS builder

WORKDIR /app

# Install workspace dependencies.
COPY package.json ./
COPY src ./src
COPY tools ./tools
COPY widgets ./widgets
COPY configs ./configs
RUN npm install

# Build required workspace packages.
RUN npm run build -w @ossinsight/types
RUN npm run build -w @ossinsight/api-server

# Keep only production dependencies.
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3450

CMD ["npm", "run", "start", "-w", "@ossinsight/api-server"]
