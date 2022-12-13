FROM node:18-alpine

# Create app directory
WORKDIR /app/web

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY ./web/package*.json .
COPY ./web/plugins ./plugins
COPY ./web/*.mjs .

RUN corepack enable
RUN corepack prepare --activate
RUN pnpm i --frozen-lockfile --strict-peer-dependencies --shamefully-hoist

# Bundle app source
COPY ./web .

# Copy the configs dir.
COPY ./configs /app/configs

EXPOSE 30000

CMD [ "npm", "run", "start-silence"]
