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
   # secrets generated in tmp_extract, move .env.tmp and .envauthentication to microservices root directory
   make decrypt
   # RUN ROOTLESS DOCKER
   make runDocker
   # BUILD AND RUN CONTAINERS 
   make dcon 
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
   # check specific service status
   make logs c=auth/traefik/fron-end
   ```
- Each service can be accessed through the API gateway, which handles routing and security.
- Refer to individual service documentation for specific API endpoints and usage instructions.

## Contributing

- @cptfran
- @frbeyer1
- @MemoCSales
- @mottjes
- @VictoriaLizCor


<!-- things to DO
 [] health monitoring
 [x] PROMETEUS / TRAEFIK METRIC
 [] restric routes for all services 
 [] include endpoint /metrics in all services
 [] chage to production mode
 [] persistant data
 [] 


-- >