Certainly! Here's a full step-by-step guide to setting up Pebble with Traefik using the `docker-compose.yml` file you provided. This will simulate the ACME certificate issuance process in a local environment.

---

### Step 1: Install Prerequisites
Ensure you have the following installed:
- Docker and Docker Compose
- A basic understanding of Traefik's configuration

---

### Step 2: Extend Your `docker-compose.yml`
We’ll add the Traefik service and configure it to use Pebble as the ACME server. Here's an updated example:

```yaml
version: '3.7'
services:
  pebble:
    image: letsencrypt/pebble
    environment:
      - PEBBLE_VA_NOSLEEP=1
    ports:
      - "14000:14000" # Pebble ACME server
      - "15000:15000" # Pebble challenge server
    networks:
      - acme_net

  traefik:
    image: traefik:v2.9 # Use the latest stable Traefik version
    command:
      - "--api.insecure=true" # Enable Traefik dashboard (for testing only)
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.test.acme.caserver=https://pebble:14000/dir"
      - "--certificatesresolvers.test.acme.email=test@example.com"
      - "--certificatesresolvers.test.acme.storage=/acme.json"
      - "--certificatesresolvers.test.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80" # HTTP
      - "443:443" # HTTPS
      - "8080:8080" # Traefik dashboard (testing only)
    volumes:
      - "./acme.json:/acme.json" # File to store certificates
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - acme_net

networks:
  acme_net:
    driver: bridge
```

---

### Step 3: Set Up the `acme.json` File
The `acme.json` file is where Traefik stores ACME certificates. Create it in the same directory as your `docker-compose.yml`:
```bash
touch acme.json
chmod 600 acme.json
```
The `chmod 600` command ensures that the file has the correct permissions for Traefik to read/write the certificates.

---

### Step 4: Add Test Containers to Generate Certificates
To test the certificate issuance process, add a container with a simple HTTP service to the `docker-compose.yml`. For example:

```yaml
  whoami:
    image: traefik/whoami
    labels:
      - "traefik.http.routers.whoami.rule=Host(`test.localhost`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls.certresolver=test"
    networks:
      - acme_net
```

This will create a service responding at `https://test.localhost`.

---

### Step 5: Update Your Local Hosts File
Since we're using a custom test domain (`test.localhost`), map it to the IP of your machine:
- On Linux/Mac: Edit `/etc/hosts`
- On Windows: Edit `C:\Windows\System32\drivers\etc\hosts`

Add this line:
```
127.0.0.1 test.localhost
```

---

### Step 6: Start the Setup
Run the following command to start your setup:
```bash
docker-compose up
```

---

### Step 7: Test the Setup
1. Open your browser and visit `https://test.localhost` to verify the certificate issuance.
2. Use `docker logs traefik` to check Traefik's logs for ACME interactions with Pebble.

---

### Step 8: Use the Traefik Dashboard (Optional)
For testing purposes, you can access the Traefik dashboard at `http://localhost:8080` to monitor routes, certificates, and configurations.

---

### Summary
This setup runs Pebble and Traefik in tandem, allowing you to simulate the ACME certificate issuance process locally. Pebble will serve as the ACME server, and Traefik will request certificates from it.

