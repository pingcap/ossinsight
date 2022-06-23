FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY *.mjs ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "run", "start", "--", "--port 8080 --host 0.0.0.0 --no-open"]