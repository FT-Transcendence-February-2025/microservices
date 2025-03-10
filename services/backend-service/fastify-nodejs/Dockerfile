FROM node:23-alpine

# Set build argument for DNS server
ARG DNS_SERVER=8.8.8.8
ENV NODE_ENV=development
# # Use the build argument to set the DNS server
# RUN echo "nameserver ${DNS_SERVER}" > /etc/resolv.conf
# # Create a directory for Docker daemon configuration
# RUN mkdir -p /etc/docker

# # Create a daemon.json file with DNS configuration
# RUN echo '{ "dns": ["8.8.8.8"] }' > /etc/docker/daemon.json
RUN apk update && apk add --no-cache curl ca-certificates openssl sqlite python3 make g++

# Create app directory
# WORKDIR /app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

EXPOSE 3020

CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]
