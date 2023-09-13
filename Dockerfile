# Use an official Node.js runtime as a parent image
FROM node:15

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy all application code to the container
COPY . .

# Expose a port that the application will listen on
EXPOSE 3000

# Define the command to run your Node.js application
CMD ["node", "index.js"]
