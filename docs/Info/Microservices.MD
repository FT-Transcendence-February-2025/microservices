# Microservices Architecture for a Game Tournament Web Service

## Introduction

*     Objective: Create a scalable and resilient web service for hosting game tournaments using microservices.
*     Key Benefits: Scalability, maintainability, and resilience.

## Microservices Overview

* Authentication and Authorization Service
        Functionality: User registration, login, and permission management.
        Technologies: OAuth, JWT (JSON Web Tokens).

*     User Management Service
        Functionality: Manage user profiles, statistics, and preferences.
        Technologies: Databases like MongoDB or PostgreSQL.

*     Tournament Service
        Functionality: Create, update, and delete tournaments. Manage user registrations and match organization.
        Technologies: Relational or NoSQL databases, REST APIs.

*     Game Service
        Functionality: Manage game creation and tracking within tournaments. Handle player matchmaking and result recording.
        Technologies: WebSockets for real-time communication, databases for result storage.

*     Notification Service
        Functionality: Send notifications about tournament updates, matches, and other relevant events.
        Technologies: Messaging services like Firebase Cloud Messaging, Twilio for SMS.

*     Payment Service (Optional)
        Functionality: Handle financial transactions for entry fees or monetary prizes.
        Technologies: Payment platforms like PayPal, Stripe.

DevOps Implementation

*     CI/CD (Continuous Integration and Continuous Deployment)
        Tools: Jenkins, GitLab CI/CD, GitHub Actions.
        Process: Automate integration and deployment for each microservice.

*     Containers and Orchestration
        Tools: Docker for containerization, Kubernetes for orchestration.
        Process: Deploy, scale, and monitor containers.

*     Monitoring and Logging
        Tools: Prometheus, Grafana for monitoring; ELK Stack (Elasticsearch, Logstash, Kibana) for logging.
        Process: Monitor performance and availability, analyze logs.

*     Configuration Management
        Tools: Consul, etcd.
        Process: Centralized configuration management, secure sensitive configurations.

Workflow Example

*     Tournament Creation
        User A creates a tournament.
        The Tournament Service registers the tournament and notifies the Game Service.

*     Game Start
        The Game Service launches a game service for the match between User A and User B.
        Players receive notifications to join the game.

*     Game End
        The game service records the result and sends it to the Results Service.
        The Results Service updates the database and notifies the Tournament Service.

*     Tournament Update
        The Tournament Service updates the tournament status and notifies players about the progress.

Recommended Technologies

*     API Gateway: NGINX, Kong.
*     Messaging: RabbitMQ, Apache Kafka.
*     Database: PostgreSQL, MongoDB.
*     Containers: Docker.
*     Orchestration: Kubernetes.

Conclusion

*     Scalability: Scale each microservice independently based on demand.
*     Maintainability: Update and maintain each component without affecting the entire system.
*     Resilience: Isolate failures in specific services, preventing system-wide issues.

# Architecture ft_transcendence

Creating a Secure Docker compose Microservice Architecture for User Management and Tournaments

1. Authentication and Authorization Service

    Functionality:
        User registration
        Login
        Permission management
    Technologies:
        OAuth
        JWT (JSON Web Tokens)
        HTTPS for secure communication
    Security:
        Implement HTTPS for all endpoints
        Use wss for WebSocket connections
        Ensure routes are protected
        Implement 2FA for added security

2. User Management Service

    Functionality:
        Manage user profiles
        Track statistics
        Handle user preferences
    Technologies:
        Databases like SQLite
        HTTPS for secure communication
    Validation:
        Implement server-side validation for all user inputs and forms

3. DNS Service

    Functionality:
        Provide DNS resolution for your services
    Technologies:
        Use a DNS service like dnsmasq or a cloud-based DNS provider
    Configuration:
        Ensure the DNS service resolves https://pong.42.fr to the appropriate IP addresses

4. Backend Service

    Functionality:
        Handle API requests
        Interact with the database
        Manage business logic
    Technologies:
        Fastify (Node.js)
        SQLite for the database
    Security:
        Ensure all API routes are protected
        Use HTTPS

5. Game Service

    Functionality:
        Manage game creation and tracking within tournaments
        Handle player matchmaking
        Record results
    Technologies:
        TypeScript
        WebSockets for real-time communication
        Databases for result storage
    Security:
        Use wss for secure WebSocket communication

6. Frontend Service

    Functionality:
        Provide the user interface for the application
    Technologies:
        HTML
        CSS
        Tailwind
        TypeScript
    Validation:
        Implement client-side validation for forms and user inputs

<!--######################################################### -->

To check if a port is listening on your Linux machine, you can use the `netstat`, `ss`, or `lsof` commands. Here are examples for each:

# ip address
`ip addr`
`ifconfig`
```
[lilizarr@c2r1s2:~/42_Cursus/ft_transcendence]$ ip route | grep default
default via 10.12.254.254 dev enp6s0 proto dhcp metric 100 
```

### Using `netstat`
```sh
sudo netstat -tuln | grep LISTEN
```

### Using `ss`
```sh
sudo ss -tuln | grep LISTEN
```

### Using `lsof`
```sh
sudo lsof -i -P -n | grep LISTEN
```

These commands will list all the ports that are currently listening for incoming connections.
<!--######################################################### -->
# Generating Certificates with Docker

## Using `mkcert`

To generate certificates using `mkcert` with Docker, run the following command:

```sh
docker run --rm -v /sgoinfre/$USER/data:/certs --privileged -it \
    -v "$(mkcert -CAROOT)":/root/.local/share/mkcert \
    mkcert/mkcert \
    -key-file /certs/privkey.key -cert-file /certs/fullchain.crt example.com "*.example.com" localhost 127.0.0.1 ::1
```

## Using `certbot`

To generate certificates using `certbot` with Docker, run the following command:

```sh
docker run --rm -v /sgoinfre/$USER/data:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt -v /var/log/letsencrypt:/var/log/letsencrypt --privileged -it certbot/certbot certonly --standalone -d example.com -d www.example.com
```