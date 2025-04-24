FROM traefik:v3.3.6

ARG DOMAIN
ARG IP

# Install curl and ca-certificates
RUN apk add --no-cache curl ca-certificates openssl jq && \
	update-ca-certificates && \
	mkdir -p /etc/traefik && \
    mkdir -p /certs

# # Copy static configuration
COPY ./config/traefik.yml /etc/traefik/traefik.yml

RUN mkdir -p /etc/traefik/logs && \
    chmod -R 777 /etc/traefik/logs

# Expose ports
EXPOSE 80
EXPOSE 443
EXPOSE 8082

WORKDIR /etc/traefik/


# Use Docker secrets for SSL certificates and update CA certificates
RUN --mount=type=secret,id=ssl_key.key,dst=/run/secrets/ssl_key.key \
    --mount=type=secret,id=ssl_crt.crt,dst=/run/secrets/ssl_crt.crt \
    --mount=type=secret,id=ssl_pem.pem,dst=/run/secrets/rootCA.pem \
    cp /run/secrets/ssl_key.key /certs/ssl_key.key && \
    cp /run/secrets/ssl_crt.crt /certs/ssl_crt.crt && \
    mkdir -p /usr/local/share/ca-certificates && \
    cp /run/secrets/rootCA.pem /usr/local/share/ca-certificates/rootCA.crt && \
    update-ca-certificates

CMD ["traefik", "--configFile=/etc/traefik/traefik.yml"]