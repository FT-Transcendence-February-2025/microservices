![FT-Transcendence header](https://github.com/user-attachments/assets/5b91df9c-a2da-41be-b104-5402d04501a4)

# FT-Transcendence

FT-Transcendence is a microservices-based full-stack web application built around online Pong gameplay: authentication, user profiles, matchmaking, tournaments, game sessions, and a frontend UI. **Traefik** is used as an API gateway to route requests to the appropriate services.

## Repositories (project components)

This repository orchestrates the system. Several components are developed in their own repositories and are integrated here (often as git submodules and/or Docker services):

- `FT-Transcendence-February-2025/authentication-service`
  - Secure authentication + authorization + account/session management
  - Access tokens (short-lived) + refresh tokens (long-lived sessions)
  - Optional multi-factor authentication (2FA/MFA)
  - Prometheus metrics + structured logging

- `FT-Transcendence-February-2025/user-management`
  - User profiles, friends, blocking
  - Avatars (local uploads + optional MinIO remote storage)
  - WebSocket notifications (friend requests, verification, tournament invites)
  - Prometheus metrics + logging

- `FT-Transcendence-February-2025/matchmaking-service`
  - Real-time matchmaking via WebSockets
  - Player queue management + match lifecycle handling
  - Integrates with game/tournament/frontend services
  - Message types used include: `joinQueue`, `matchAccept`, `leaveQueue`, `matchCancelled`

- `FT-Transcendence-February-2025/tournament-service`
  - Tournament orchestration service for FT-Transcendence.
  - **Stack:** Node.js (ESM) + **Fastify**, **better-sqlite3** (SQLite), **WebSockets** (`@fastify/websocket`), CORS, optional static serving.
  - Includes **JWT validation** (`jwt-validator-tr`), **UUID** identifiers, and tooling for **metrics** (`prom-client`), `.env` configuration (`dotenv`), and scheduled jobs (`cron`).
  - Run scripts: `npm run dev` (nodemon) / `npm start` (node `src/server.js`).

- `FT-Transcendence-February-2025/frontend`
  - **Tech stack:** Vite, TypeScript, Tailwind CSS, Nginx
  - **SPA** (single-page application)
  - Custom router for navigation + dynamic component rendering
  - Uses native **Web Components API** + HTML templates for encapsulated, reusable UI elements
  - Responsive design (mobile/tablet/desktop)

- `FT-Transcendence-February-2025/game-logic`
  - **Game logic (WIP)** repository for FT-Transcendence Pong.
  - Currently documented as TODO work focusing on: local one-keyboard gameplay logic, improving render cadence (e.g. 60 FPS) with prediction, adding sound/visual polish, better background animation, waiting/opponent (win/loss) screens, and responsive menu design.

## Project Structure (this repo)

```
ft_transcendence
├── docker-compose.yml        # Defines services, networks, and volumes for Docker services
├── services
│   ├── authentication-service
│   ├── traefik               # Traefik configuration (static + dynamic)
│   ├── user-service
│   ├── tournament-service
│   ├── matchmaking-service
│   ├── game-session-service
│   └── frontend-service
├── scripts
│   └── quickRun              # Local dev helper scripts (see "Run local environment")
└── README.md
```

## Services Overview (runtime)

1. **Authentication Service**
   - Registration/login/session management
   - OAuth/JWT style flows (implementation details in the service repo)

2. **User Management Service**
   - Profiles, friends, avatars, notifications

3. **Tournament Service**
   - Tournament creation, enrollment, scheduling

4. **Matchmaking Service**
   - Match creation, queue handling, WebSockets

5. **Game Session Service**
   - Game sessions and real-time communication

6. **Frontend**
   - SPA UI served by Nginx, built with Vite + TypeScript + Tailwind
   - Uses Web Components + a custom router

## Setup Instructions

### 0) WSL & Docker setup (recommended)

Please refer to:
- [Rootless Docker Guide](docs/RootlessDocker.MD)

### 1) Clone (this repo uses git submodules)

**Recommended (clone with submodules):**
```bash
git clone --recurse-submodules git@github.com:FT-Transcendence-February-2025/microservices.git
cd microservices
```

**If you already cloned without submodules:**
```bash
cd microservices
git submodule update --init --recursive
```

### 2) Sync your clone with `main` (repo + submodules)

This updates the main repo to `origin/main` and then syncs submodules to the exact commits recorded by that revision.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

git submodule sync --recursive
git submodule update --init --recursive
```

> Tip: `git submodule update --init --recursive` checks out the **pinned commits** recorded by this repository.  
> If you instead want submodules to move to the latest commit of their configured remote branches, use:
>
> ```bash
> git submodule update --init --recursive --remote
> ```

### 3) Build and start the services (Docker Compose)

```bash
# secrets generated in tmp_extract, move secrets folder (contains .env.tmp and .envauthentication) to root directory
make decrypt

# RUN ROOTLESS DOCKER
make runDocker

# BUILD AND RUN CONTAINERS in debug mode
make D=1 dcon
```

### 4) Access the application

Access the application through the Traefik gateway with `${IP}` or `${DOMAIN}`:

```bash
# open private firefox window
make browser
# 127.0.0.1
```

## Usage Guidelines

```bash
# check all services status
make logs

# check specific service status (choose only one if variable 'c' is used)
make logs c=auth|traefik|front|user|game|tour|match
```

- Each service can be accessed through the API gateway (Traefik), which handles routing and security.
- For service-specific environment variables and development commands, refer to each component repository README.

### Rebuild containers
```bash
make D=1 rebuild c=auth|traefik|front|user|game|tour|match
```

### Run one container
```bash
make D=1 dcon c=auth|traefik|front|user|game|tour|match
```

## Run local environment

You can find commands to use in `scripts/quickRun`.

1. Start services:
```bash
make runLocal
# starts all services in the same window, printing only when changes happen or server crashes
```

2. Stop services:
```bash
make stopLocal
```

3. Check if services are running:
```bash
make checkLocal
```

4. Check if ports are free:
```bash
make checkPorts
```

## Contributing

- @cptfran
- @frbeyer1
- @MemoCSales
- @mottjes
- @VictoriaLizCor

## Project Roadmap

### Infrastructure & Monitoring
- [ ] Grafana dashboard implementation
- [ ] Complete health monitoring setup
- [x] Prometheus/Traefik metrics integration
- [ ] Nginx server metrics integration
- [ ] Change to production mode
- [ ] Ensure persistent data storage
- [ ] Fix container removal issues

### Security
- [ ] Restrict routes for all services

### Feature Implementation
- [ ] Health monitoring
- [ ] Implement WebSocket connections for:
  - [ ] Game service
  - [ ] Match service
  - [ ] Tournament service
- [ ] Notification system
