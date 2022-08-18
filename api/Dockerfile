# Build stage.
FROM node:18-alpine AS builder

RUN npm install pnpm -g

WORKDIR /usr/src/app

COPY . ./

RUN pnpm i --frozen-lockfile

# Runtime stage.
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
EXPOSE 3450
CMD ["npm", "run", "server"]