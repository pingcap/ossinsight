FROM node:18-alpine AS deps

WORKDIR /app
COPY ./package.json ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ./configs /app/configs
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 30000
CMD ["npm", "run", "start"]
