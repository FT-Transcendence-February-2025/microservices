
To handle **WebSockets** between your **frontend** and **backend (match service)** while using **Traefik**, you need to ensure that WebSocket connections are correctly routed and forwarded through your reverse proxy. Here’s how to properly configure **WebSockets handling in Traefik** and **connect your frontend to the match service**.

---

### **1. WebSockets Basics in Traefik**
WebSockets require proper handling of **Upgrade** and **Connection** headers to ensure persistent connections. Unlike regular HTTP requests, WebSocket connections need to stay open for bidirectional communication.

Since your **match service** is running at:
```
http://localhost:3003/api/game?matchId=
```
And your frontend is expected to request it via:
```
https://domain/api/match/game?matchId=
```
Traefik needs a proper configuration to **route WebSocket traffic**, ensuring that the request upgrade mechanism works correctly.

---

### **2. Updating Traefik Configuration for WebSockets**
Add WebSocket support in your Traefik labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.match-service.rule=Host(`${DOMAIN}`) && PathPrefix(`/api/match/game`)"
  - "traefik.http.routers.match-service.entrypoints=websecure"
  - "traefik.http.routers.match-service.tls=true"
  - "traefik.http.routers.match-service.middlewares=match-ws"
  - "traefik.http.services.match-service.loadbalancer.server.port=3003"

  # WebSocket middleware settings
  - "traefik.http.middlewares.match-ws.headers.customrequestheaders.Connection=Upgrade"
  - "traefik.http.middlewares.match-ws.headers.customrequestheaders.Upgrade=websocket"
```

**Key Additions:**
- **Routing:** Defines `/api/match/game` so that Traefik correctly forwards WebSocket traffic.
- **Upgrade Headers:** Ensures WebSockets requests include `Connection=Upgrade` and `Upgrade=websocket`, allowing persistent socket connections.

---

### **3. Connecting WebSockets from the Frontend**
In your frontend, ensure you correctly initialize the WebSocket connection:

```javascript
const matchId = "example123"; // Replace dynamically
const socket = new WebSocket(`wss://domain/api/match/game?matchId=${matchId}`);

socket.onopen = () => {
    console.log("WebSocket connected!");
};

socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
};

socket.onerror = (error) => {
    console.error("WebSocket Error:", error);
};

socket.onclose = () => {
    console.log("WebSocket closed.");
};
```

**Key Frontend Adjustments:**
- **Use `wss://` for WebSockets over HTTPS.**
- **Ensure the `matchId` is dynamically injected into the WebSocket request URL.**
- **Use proper event listeners (`onopen`, `onmessage`, `onerror`, `onclose`) to handle WebSocket communication.**

---

### **4. Testing WebSocket Connectivity**
After deploying your **backend**, **Traefik**, and **frontend**, test your WebSocket connection:
```bash
wscat -c wss://domain/api/match/game?matchId=example123
```
If `wscat` is not installed, install it globally:
```bash
npm install -g wscat
```

You should see successful connections if Traefik correctly forwards WebSocket traffic.

---

### **Final Thoughts**
- Traefik requires **custom headers (`Connection=Upgrade` & `Upgrade=websocket`)** for WebSocket connections.
- Ensure the frontend is using `wss://` instead of `https://` for WebSocket connections.
- Use **wscat** or browser tools to debug WebSocket connections.
- If WebSockets fail, check **Traefik logs** and **backend logs** for errors.


When a user connects to a WebSocket, they typically won’t see the WebSocket URL (`wss://domain/api/match/game?matchId=123`) in their browser’s address bar like they would with standard HTTP requests.

**Why?**  
WebSockets don’t work like traditional web navigation—they are a background communication channel rather than a page URL that gets displayed in the browser’s address bar. The frontend makes the WebSocket connection **inside the code** (e.g., in JavaScript), so the user doesn’t directly navigate to it.

---

### **How Users Can See WebSocket Activity**
Even though they won’t see the WebSocket connection URL in their address bar, there are ways for them to check WebSocket activity:

1. **Browser Developer Tools**  
   - In **Chrome or Firefox**:  
     - Open DevTools (`F12` or `Ctrl+Shift+I`).  
     - Go to the **Network** tab.  
     - Filter for **WS** (WebSockets).  
     - You can see the WebSocket request URL and live messages.  

2. **Logging the Connection** (for debugging)  
   If needed, the frontend can **log the WebSocket URL** when a connection is established:
   ```javascript
   const matchId = "123";
   const socketUrl = `wss://domain/api/match/game?matchId=${matchId}`;
   console.log("Connecting to:", socketUrl);
   const socket = new WebSocket(socketUrl);
   ```

3. **Custom UI in the Frontend**  
   If you **want users to be aware of the connection**, you could display the WebSocket status in the UI:
   ```javascript
   document.getElementById("status").innerText = `Connected to: ${socketUrl}`;
   ```
   This way, users can see what backend service they are connected to.

---

### **How This Works with Traefik**
Even though Traefik routes WebSocket connections through `https://domain/api/match/game`, users will **only see the frontend page URL** (`https://domain/somepage`). The WebSocket connection happens **in the background**, invisible to the user except through DevTools or debug logging.

Would you like help setting up WebSocket connection monitoring or handling reconnections? 🚀



Monitoring Architecture Overview
Core Technologies

    Prometheus: Metrics collection and alerting engine
    Grafana: Visualization and dashboarding platform
    cAdvisor: Container resource usage and performance monitoring
    Node Exporter: System metrics collection (CPU, memory, disk, network)
    Postgres Exporter: PostgreSQL metrics collection

Prometheus

Purpose: Time-series database for metrics collection and alerting

Features:

    Pull-based metrics collection
    Flexible query language (PromQL)
    Alerting rules engine
    Service discovery

Configuration:

    15-second scrape interval
    Configured targets:
        Self-monitoring (prometheus:9090)
        Node Exporter (node-exporter:9100)
        cAdvisor (cadvisor:8080)
        Postgres Exporter (postgres_exporter:9187)

Grafana

Purpose: Visualization platform for metrics, logs, and alerts

Features:

    Interactive dashboards
    Rich visualization options
    Multi-data source support
    User authentication and authorization
    Alerting capabilities

Configuration:

    Secure credential management through HashiCorp Vault

Dashboard Provisioning

Auto-provisioned Dashboards:

    System metrics dashboard
    PostgreSQL monitoring dashboard
    Container monitoring (cAdvisor) dashboard

Configuration:

    Dashboard auto-discovery from files
    10-second update interval
    UI updates allowed
    Dashboard edits preserved

Data Sources

Prometheus Data Source:

    Auto-configured as default data source
    Direct proxy access to Prometheus
    Editable by users

cAdvisor

Purpose: Container resource usage monitoring

Features:

    CPU, memory, network, and file system usage per container
    Historical resource usage
    Container metadata collection

Integration:

    Metrics exposed on port 8080
    Scraped by Prometheus every 15 seconds
    Visualized through dedicated Grafana dashboard

Node Exporter

Purpose: Host-level metrics collection

Features:

    CPU statistics
    Memory usage
    Disk I/O
    Network traffic
    System load

Integration:

    Metrics exposed on port 9100
    Scraped by Prometheus every 15 seconds
    Visualized in system dashboard


Alert Notifications

Notification Channels:

    Email alerts for critical issues
    Webhook integration for automated response
    On-screen notifications in Grafana UI

Monitoring Coverage
Application Monitoring

Microservice Health:

    Up/down status monitoring
    Response time tracking
    Error rate monitoring
    Request volume metrics

Infrastructure Monitoring

Container Health:

    Resource usage per container
    Restart counts
    Network traffic between services

Database Monitoring

PostgreSQL Health:

    Connection pool utilization
    Transaction rates
    Query performance
    Bloat and vacuum monitoring

Deployment Configuration
Container Setup

Resource Allocation:

    Prometheus: 2GB memory allocation
    Grafana: 1GB memory allocation

Persistence:

    Prometheus data stored in persistent volume
    Grafana configurations and dashboards preserved

Network Configuration

Exposed Ports:

    Grafana UI: Port 3000
    Prometheus UI: Port 9090 (internal only)

Inter-service Communication:

    All monitoring components on dedicated monitoring network
    Direct service names used for communication

Benefits

    Proactive Issue Detection: Alerts before problems affect users
    Performance Optimization: Identify bottlenecks and resource constraints
    Capacity Planning: Track resource usage trends over time
    Troubleshooting: Correlate metrics with application issues
    Transparency: Clear visibility into system health and behavior This comprehensive monitoring architecture provides robust observability across all components of the Transcendence application, from infrastructure to application performance.
