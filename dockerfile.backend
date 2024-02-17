# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /my-vr-ap/server
# Copy package.json and package-lock.json to the working directory
COPY server/package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY ./server .

# Copy .env file into container
COPY .env ./

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables from .env file
ENV $(cat .env | xargs)

# Define the command to run your app
CMD ["node", "server.js"]