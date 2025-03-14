# Stage 1: Build the frontend assets
FROM node:20-alpine as builder

WORKDIR /app/frontend

# Install dependencies and build the frontend
COPY ./src/frontend/*.json ./
RUN npm install
COPY ./src/frontend/ ./
RUN npm run build

# Stage 2: Set up the backend
FROM node:20-alpine as runtime


WORKDIR /app/backend

# Install dependencies
COPY ./src/backend/*.json ./
RUN npm install

# Copy the backend code
COPY ./src/backend/ ./

# Copy the built frontend assets to the backend directory
COPY --from=builder /app/frontend/public /app/backend/src/frontend/public

# Expose the port for the Fastify server
EXPOSE 3000

# Start the Fastify server
CMD ["npm", "start"]