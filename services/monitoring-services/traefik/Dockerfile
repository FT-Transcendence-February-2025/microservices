FROM traefik:v3.3.3

# Install curl and ca-certificates
RUN apk add --no-cache curl ca-certificates openssl jq && \
	update-ca-certificates && \
	mkdir -p /etc/traefik

# # Copy static configuration
COPY ./config/traefik.yml /etc/traefik/traefik.yml

RUN mkdir -p /etc/traefik/logs && \
    chmod -R 777 /etc/traefik/logs
# Create and set permissions for acme.json
# RUN touch /etc/traefik/acme.json && chmod 600 /etc/traefik/acme.json

# Expose ports
EXPOSE 80
EXPOSE 443
EXPOSE 8080

WORKDIR /etc/traefik/
ARG DOMAIN
ARG DOMAIN_TEST
ARG IP

RUN env
# ENV DSN_SERVER=${DSN_SERVER}
# ENV DNS_SEARCH=${DNS_SEARCH}

# Use Docker secrets for SSL certificates and update CA certificates
RUN --mount=type=secret,id=ssl_key.key,dst=/run/secrets/ssl_key.key \
    --mount=type=secret,id=ssl_crt.crt,dst=/run/secrets/ssl_crt.crt \
    --mount=type=secret,id=ssl_pem.pem,dst=/run/secrets/rootCA.pem \
    cp /run/secrets/rootCA.pem /usr/local/share/ca-certificates/rootCA.crt && \
    update-ca-certificates
CMD ["traefik", "--configFile=/etc/traefik/traefik.yml"]
# CMD ["sh", "-c", "traefik --configFile=/etc/traefik/traefik.yml | tee /traefik/logs/access.log"]
# CMD ["sh", "-c", "traefik --configFile=/etc/traefik/traefik.yml | tee /etc/traefik/logs/traefik.log"]