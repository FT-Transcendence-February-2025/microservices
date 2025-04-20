# Recommended Traefik Priority Values for All Services

Recommended priority values for micrservices, organized by category:

## Authentication Services (300-310)
- **Authentication Service**: 300 (`/api/auth/*`)

## API Backend Services (200-290)
- **User Management Service**: 290 (`/api/users/*`)
- **Game Service**: 280 (`/api/games/*`)
- **Tournament Service**: 270 (`/api/tournaments/*`) 
- **Match Service**: 260 (`/api/matches/*`)
- **Other API Services**: 210-250 (for future services)

## WebSocket Connections (195-199)
- **WebSocket Game**: 199 (`/ws/game/*`)
- **WebSocket Chat**: 198 (`/ws/chat/*`) 
- **Other WebSockets**: 195-197

## Frontend Services (100-190)
- **Frontend Main App**: 190 (catch-all for non-API routes)
- **Frontend Static Assets**: 180 (`/static/*`, `/assets/*`)
- **Frontend Auth Pages**: 170 (`/login`, `/register`, `/reset-password`)

## Monitoring & Observability (50-95)
- **Prometheus**: 95 (`/prometheus/*`)
- **Grafana**: 90 (`/grafana/*`)
- **Kibana**: 85 (`/kibana/*`)
- **Elasticsearch API**: 80 (`/es/*`)
- **Alertmanager**: 75 (`/alertmanager/*`)
- **Loki**: 70 (`/loki/*`)
- **Jaeger/Tempo**: 65 (`/jaeger/*`)

## Traefik Internal Tools (20-45)
- **Traefik API**: 45 (`/api/traefik/*`)
- **Traefik Dashboard**: 40 (`/dashboard/*`)
- **Traefik Metrics**: 30 (`/metrics`)

## Infrastructure Services (0-19)
- **Nginx DNS Service**: 15
- **Health Checks/Status**: 10 (`/health`, `/status`)
- **Default Routes**: 0 (lowest priority, catch-all)


This priority structure ensures that your most specific and critical routes have the highest priority, while less specific routes have lower priority. It also maintains a clear separation between your application services, monitoring tools, and infrastructure components.