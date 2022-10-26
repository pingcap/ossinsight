FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY plugins ./plugins
COPY *.mjs ./

RUN npm ci

# Bundle app source
COPY . .

EXPOSE 30000
CMD [ "npm", "run", "start-silence"]