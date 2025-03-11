FROM traefik:v3.3.3

# Install curl and ca-certificates
RUN apk add --no-cache curl ca-certificates openssl && \
	mkdir -p /etc/traefik

# # Copy static configuration
COPY ./config/traefik.yml /etc/traefik/traefik.yml

# Create and set permissions for acme.json
RUN touch /etc/traefik/acme.json && chmod 600 /etc/traefik/acme.json

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
CMD ["traefik", "--configFile=/etc/traefik/traefik.yml"]