FROM node:14

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Set env
ENV NODE_ENV production

# Build
RUN yarn build

EXPOSE 4000
CMD [ "node", "dist/index.js" ]