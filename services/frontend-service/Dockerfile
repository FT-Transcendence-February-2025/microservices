# Stage 1: Build the static assets using Vite
FROM node:20-alpine as builder


ARG DOMAIN
ARG DOMAIN_TEST

WORKDIR /app

# Copy package files and install dependencies (including dev)
COPY src/package*.json ./
RUN npm install --include=dev

# Copy all source files and build the project (adjust if your build output folder is different)
COPY src .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine as runtime

ARG DEBUG_MODE

RUN if [ "$DEBUG_MODE" = "1" ]; then apk update && apk add --no-cache curl openssl jq; fi

# Update package list and install Nginx and OpenSSL
RUN rm -rf /var/cache/apk/* \
    && rm /etc/nginx/conf.d/default.conf \
    && rm /usr/share/nginx/html/index.html

# Copy the Vite build output (by default Vite outputs to /dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file
COPY ./nginx/conf/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/conf/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx


CMD ["nginx", "-g", "daemon off;"]


FROM alpine:latest as final

COPY --from=runtime / /

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]