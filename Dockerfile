FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY *.mjs ./

RUN npm ci

# Bundle app source
COPY . .
ENV APP_API_BASE=http://host.docker.internal:3450
RUN npm run build

EXPOSE 30000
CMD [ "npm", "run", "serve", "--", "--port", "30000"]