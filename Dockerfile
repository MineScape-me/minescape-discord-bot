# Start from the official Node.js LTS base image
FROM node:lts

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install the project dependencies
RUN yarn install

# Copy the rest of the project files to the working directory
COPY . .
RUN yarn build

# Start the application
CMD [ "yarn", "start" ]