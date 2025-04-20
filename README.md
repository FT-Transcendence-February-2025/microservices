# Microservices Project

This project is a microservices architecture designed for managing tournaments, matchmaking, game sessions, and user profiles. It utilizes Traefik as an API gateway to route requests to the appropriate services.

## Project Structure

```
ft_transcendence
├── docker-compose.yml        # Defines services, networks, and volumes for Docker  services
├── services
│   ├── authentication-service
│   │   ├── src
│   │   │   └── app.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── traefik                   # Traefik configuration files
│   │   ├── traefik.yml           # Static configuration for Traefik
│   │   └── dynamic
│   │       └── config.yml        # Dynamic routing rules and middleware
│   ├── user-service              # User Service for authentication and profile management
│   │   ├── Dockerfile            # Dockerfile for building User Service image
│   │   └── src                   # Source code for User Service
│   │       └── ...
│   ├── tournament-service         # Tournament Service for managing tournaments
│   │   ├── Dockerfile            # Dockerfile for building Tournament Service image
│   │   └── src                   # Source code for Tournament Service
│   │       └── ...
│   ├── matchmaking-service        # Matchmaking Service for player matching
│   │   ├── Dockerfile            # Dockerfile for building Matchmaking Service image
│   │   └── src                   # Source code for Matchmaking Service
│   │       └── ...
│   ├── game-session-service       # Game Session Service for managing game sessions
│   │   ├── Dockerfile            # Dockerfile for building Game Session Service image
│   │   └── src                   # Source code for Game Session Service
│   │       └── ...
│   └── frontend-service           # Frontend Service for user interface
│      ├── Dockerfile            # Dockerfile for building Frontend Service image
│      └── src                   # Source code for Frontend Service
│          └── ...
└── README.md                 # Project documentation
```

## Services Overview

1. **Authentication Service**
   - Handles user registration, login, and permission management.
   - Utilizes OAuth and JWT for secure authentication.
2. **User Service**: Handles user authentication, registration, and profile management.
3. **Tournament Service**: Manages tournament creation, enrollment, and scheduling.
4. **Matchmaking Service**: Matches players based on skill and manages real-time queues.
5. **Game Session Service**: Manages game sessions and facilitates real-time communication.
6. **Frontend Service**: Provides the user interface and interacts with the API gateway.

## Setup Instructions
0. WSL & Docker set up:
   Please refere to documentation
   [Rootless Docker Guide](docs/RootlessDocker.MD)
   
2. Clone the repository:
```
   git clone git@github.com:FT-Transcendence-February-2025/microservices.git
   cd microservices-project
```

3. Build and start the services using Docker Compose:
```bash
   # secrets generated in tmp_extract, move secrets folder (contains .env.tmp and .envauthentication) to root directory
   make decrypt
   # RUN ROOTLESS DOCKER
   make runDocker
   # BUILD AND RUN CONTAINERS in debug mode, 
   make D=1 dcon
   #docker-compose up --build
```

4. Access the application through the Traefik gateway with ${IP} or ${DOMAIN}
```bash
   # open private firefox window 
   make browser
   # 127.0.0.1
```
## Usage Guidelines
```bash
   #check all services status
   make logs
   # check specific service status (choose only one if variable  'c' is used)
   make logs c=auth|traefik|front|user|game|tour|match
```
- Each service can be accessed through the API gateway, which handles routing and security.
- Refer to individual service documentation for specific API endpoints and usage instructions.
5. Rebuild container
```bash
   make D=1 rebuild c=auth|traefik|front|user|game|tour|match
```
6. Run one container
```bash
   make D=1 dcon c=auth|traefik|front|user|game|tour|match
```
# Run local enviroment
you can find commands to use in `scripts/quickRun `
1. Start services
```bash
  make runLocal
  #it will start all services in same window, printing only when changes happend or server crashes
```
2. Stop services
```bash
  make stopServices
```
3. Check if services are running 
```bash
  make checkServices
```
4. Check if ports are free
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
- [x] Add /metrics endpoint in game service
- [ ] Implement WebSocket connections for:
- [ ] Game service
- [ ] Match service
- [ ] Tournament service
- [ ] Notification system
<!-- things to DO
<!-- things to DO
 

# Authentication (highest priority)
- "traefik.http.routers.authentication-service.priority=300"

# API Backend Services
- "traefik.http.routers.user-mgmt-service.priority=290"
- "traefik.http.routers.game-service.priority=280"
- "traefik.http.routers.match-service.priority=270"
- "traefik.http.routers.tournament-service.priority=260"

# Frontend
- "traefik.http.routers.frontend-service.priority=190"

# Infrastructure Services
- "traefik.http.routers.elasticsearch.priority=75"
- "traefik.http.routers.traefik-api.priority=80"      
- "traefik.http.routers.kibana.priority=80"
- "traefik.http.routers.alertmanager.priority=70"
- "traefik.http.routers.traefik-dashboard.priority=60" 
- "traefik.http.routers.traefik-metrics.priority=40"
- "traefik.http.routers.nginx-dns-service.priority=20"

-- >
