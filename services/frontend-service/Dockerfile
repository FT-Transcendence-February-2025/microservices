# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY src/*.json ./
RUN ls
RUN npm install --include=dev

# Copy the entire source (or split as above)
COPY ./src .
RUN ls -l
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/
EXPOSE 3000
CMD ["npm", "start"]