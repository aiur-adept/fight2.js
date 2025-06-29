# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 8080 to match the application
EXPOSE 8080

# Define environment variable
ENV NODE_ENV=development

# The command will be overridden by docker-compose for development
CMD ["npm", "run", "devserver"]
