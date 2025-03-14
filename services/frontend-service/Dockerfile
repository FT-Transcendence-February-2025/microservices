# Stage 1: Build the frontend assets
FROM node:20-alpine AS build-frontend

WORKDIR /app/frontend

# Install dependencies and build the frontend
COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# Stage 2: Set up the backend
FROM node:20-alpine

WORKDIR /app/backend

# Install dependencies
COPY src/backend/package.json src/backend/package-lock.json ./
RUN npm install

# Copy the backend code
COPY src/backend/ ./

# Copy the built frontend assets to the backend directory
COPY --from=build-frontend /app/frontend/public /app/backend/src/frontend/public

# Expose the port for the Fastify server
EXPOSE 3000

# Start the Fastify server
CMD ["npm", "start"]