Below is a step‑by‑step explanation of how your front‑end, redirection to websecure, and Traefik routers work together when a user submits a login form. This example assumes that:

- Your site is initially reached via HTTP but automatically redirects to HTTPS (websecure).  
- Your front‑end service is configured to serve the login page, delivering a login form with an action targeting a friendly URL (e.g. `/login`).  
- Traefik is set up to rewrite the public URL (e.g. `/login`) to the internal API endpoint (e.g. `/api/login`), injects necessary headers, and only then forwards the request to your back‑end (API) service.

Let’s break down the flow:

---

## Step‑by‑Step Flow

1. **Initial Request & Redirection to HTTPS (Websecure):**  
   - **User’s Browser:** The user enters “http://domain” in their browser.
   - **Traefik’s HTTP Router:** A global HTTP-to-HTTPS redirect (or a dedicated router) intercepts the request and responds with a redirect to the secure endpoint (e.g., “https://domain”).  
   - **Outcome:** The browser now makes a new HTTPS request against the domain.

2. **Serving the Front‑End Page with the Login Form:**  
   - **Front‑End Service:** Once connected over HTTPS (websecure), the front‑end service serves the landing page, which includes the login form.
   - **Login Form Action:** The form’s action is set to something like `/login` (a clean, public URL that users see).
   - **User Interaction:** The user fills in the form and submits (usually via a POST request).

3. **Submission of the Login Form:**  
   - **Browser’s Submission:** The browser sends a request (e.g., POST) to `https://domain/login`.
   - **Traefik’s Router Matching:**  
     - A router listens for requests matching the host (`domain`) and the path `/login`.
     - **Rewrite Middleware:** Before forwarding, Traefik applies a rewrite middleware that changes the request’s path from `/login` to `/api/login` (this is done using the `ReplacePathRegex` middleware).  
     - **Header Injection (Optional but Recommended):** Another middleware injects a custom header (for example, `X-Allow-API: true`) into the request to “mark” it as a legitimate submission coming from the front‑end.

4. **Forwarding to the Proper Back‑End Service:**  
   - **Authorized API Router:** A second router in Traefik handles paths starting with `/api` but only accepts them if the required header is present.  
   - **Traffic Direction:** The rewritten and “approved” request (`/api/login` plus the header) is forwarded to the back‑end (API) service responsible for authentication.
   - **Back‑End Processing:** The back‑end service receives the request at `/api/login`, processes the login (e.g., credential verification, creating a session, etc.), and sends back a response.

5. **Handling Unauthorized / Direct API Requests:**  
   - If a client were to try to call `/api/login` directly (bypassing the front‑end) without having the injected header:
     - A different router (with a lower priority) would catch these requests.
     - Either an error or a redirection (for example, to an `/error403` page) is issued, ensuring that only requests that come via the front‑end (and thus have gone through the proper rewriting steps) reach your back‑end service.

---

## Visual Overview

Below is a simplified ASCII flow diagram showing the sequence:

```
User's browser
      │
      │  (HTTP request: http://domain)
      ▼
─────────────────────────
  Traefik (HTTP router)
  - Redirects to HTTPS  
─────────────────────────
      │
      │  (Browser now connects via HTTPS: https://domain)
      ▼
─────────────────────────
  Front‑End Service
  - Serves login page with form  
─────────────────────────
      │
      │ (User submits login form → POST https://domain/login)
      ▼
────────────────────────────────────────────────────────────
  Traefik (Router for /login)
  - Matches request on host & path
  - **Rewrite Middleware:** Changes /login → /api/login  
  - **Header Middleware:** Adds X-Allow-API: true  
────────────────────────────────────────────────────────────
      │
      │ (Rewritten & approved request: /api/login + header)
      ▼
─────────────────────────
  Traefik (Authorized API Router)
  - Matches /api and header
─────────────────────────
      │
      │ (Forward to back‑end service)
      ▼
─────────────────────────
   Back‑End (API) Service
   - Processes login request
─────────────────────────
      │
      │ (Response flows back to user's browser via Traefik)
      ▼
 User's browser (Login response received)
```

---

## Summary

- **Redirection to HTTPS:** Ensures all communications occur over a secure channel.
- **Front‑End Service:** Delivers the login page.
- **Traefik Routers & Middlewares:**  
  - The public router intercepts `/login` requests.
  - A rewrite middleware changes the request path to `/api/login`.
  - A header middleware marks the request, confirming it came from the front‑end.
  - An authorized API router forwards the approved request to the back‑end.
- **Blocking Unauthorized Access:**  
  Direct calls to `/api/login` that miss the header don’t reach your back‑end and can be redirected to an error page.

This configuration ensures that clients always interact with a clean public URL (e.g., `/login`), while internal API endpoints (e.g., `/api/login`) are protected and only accessible when the proper flow is followed.

Would you like further details on any particular middleware configuration or additional examples on enforcing strict access controls (such as rate limiting or IP whitelisting) for your API endpoints?


Below is an approach to hide the authentication endpoints from the end user’s browser while still letting your front‑end talk to your authentication service. The idea is to have your front‑end use relative API paths (for example, `/api/auth/login`, `/api/auth/logout`, etc.) so that the user never sees the dedicated auth subdomain (like `auth.domain`). Then Traefik is configured as an internal reverse proxy that rewrites/forwards those requests to your authentication service. (Keep in mind that—even though the URL in the Network tab will show your unified domain—the request still appears there. There’s no way to completely hide a network request from the browser. This setup at least “hides” the real backend URL and keeps the user experience seamless.)

Below are examples covering both server-side (Fastify + TypeScript with CORS on your authentication service) and the Traefik routing configuration to achieve this.

---

## 1. Traefik Configuration

In this setup your front‑end makes AJAX calls to endpoints like `/api/auth/login` on your main domain (e.g. `https://domain/api/auth/login`). Then Traefik intercepts these calls and—invisibly to the user—rewrites or modifies the request as needed so that it is forwarded to your authentication service (which may expect requests on the host `auth.domain`). One way to do that is to override the Host header so that the authentication service’s router (configured for `auth.domain`) matches.

Below is an example of a portion of your Traefik labels (or dynamic configuration) that handles the authentication endpoints:

```yaml
# In your Traefik configuration (for example, defined on the Traefik container)
labels:
  - "traefik.enable=true"

  ##############################
  # 1. External Redirect: HTTP → HTTPS
  ##############################
  - "traefik.http.routers.http-catchall.rule=Host(`${DOMAIN}`) || Host(`${IP}`) || Host(`127.0.0.1`)"
  - "traefik.http.routers.http-catchall.entrypoints=web"
  - "traefik.http.routers.http-catchall.middlewares=redirect-to-https"
  - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"

  ##############################
  # 2. Front‑End Router (Serving Your SPA)
  ##############################
  - "traefik.http.routers.frontend-router.rule=Host(`${DOMAIN}`)"
  - "traefik.http.routers.frontend-router.entrypoints=websecure"
  - "traefik.http.routers.frontend-router.tls=true"
  - "traefik.http.services.frontend-service.loadbalancer.server.port=3000"

  ##############################
  # 3. API Router for Auth endpoints (Internal Reverse Proxy)
  # Front‑end calls endpoints like /api/auth/...
  # This router will catch those requests on your main domain
  ##############################
  - "traefik.http.routers.api-auth-router.rule=Host(`${DOMAIN}`) && PathPrefix(`/api/auth`)"
  - "traefik.http.routers.api-auth-router.entrypoints=websecure"
  - "traefik.http.routers.api-auth-router.tls=true"
  - "traefik.http.routers.api-auth-router.priority=90"
  # Here we attach a middleware that overrides the Host header so that your auth service sees:
  #   Host: auth.${DOMAIN}
  - "traefik.http.routers.api-auth-router.middlewares=change-host-to-auth"

  # Define the middleware for changing the Host header
  - "traefik.http.middlewares.change-host-to-auth.headers.customrequestheaders.Host=auth.${DOMAIN}"

  # And forward the request to the authentication service (listening on port 3001)
  - "traefik.http.routers.api-auth-router.service=authentication-api-service"

  # 4. Authentication API Service definition:
  - "traefik.http.services.authentication-api-service.loadbalancer.server.port=3001"
```

**How This Works:**

- **Front‑end Calls:** Your front‑end JavaScript calls a relative URL such as `/api/auth/login`. To the user, the URL is on your main domain (e.g. `https://domain/api/auth/login`).
- **Traefik Routing:** Traefik’s `api-auth-router` catches any request starting with `/api/auth`.
- **Middleware (Host Override):** The middleware `change-host-to-auth` rewrites the request’s Host header to `auth.domain` behind the scenes.
- **Forwarding to Authentication Service:** The modified request then is routed to your authentication service (which is configured with a router that matches `Host(auth.domain)` and expects endpoints like `/login`, `/logout`, etc.)  
- **Result:** The browser still displays the main domain in the URL, while internally the request reaches the correct back‑end endpoint.

---

## 2. Fastify Authentication Service Setup (TypeScript)

Your authentication service is running on its own subdomain (virtually, behind Traefik) and listens on a port (e.g., 3001). With Fastify and TypeScript, you can configure the service to allow CORS from your front‑end domain, even though the browser won’t call it directly.

**File: `server.ts`**

```typescript
import fastify from 'fastify';
import cors from '@fastify/cors';

const app = fastify({
  logger: true,
});

// Configure CORS to allow your front‑end (but note: with the reverse proxy the user won’t see this domain)
app.register(cors, {
  origin: (origin, callback) => {
    // Whitelist your front‑end domain
    const allowedOrigins = ['https://domain', 'https://www.domain'];
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // Allow cookies/credentials if needed
});

// Define your authentication endpoints
app.get('/login', async (request, reply) => {
  return { message: 'Display login page data' };
});

app.post('/login', async (request, reply) => {
  // Process login
  return { message: 'Login successful', token: 'access-token' };
});

app.get('/logout', async (request, reply) => {
  return { message: 'Logged out successfully' };
});

app.post('/register', async (request, reply) => {
  // Process registration
  return { message: 'Registration successful' };
});

app.post('/password', async (request, reply) => {
  // Process password change/reset
  return { message: 'Password updated' };
});

app.post('/refresh', async (request, reply) => {
  // Process token refresh
  return { message: 'Token refreshed', token: 'new-access-token' };
});

// Start your authentication service on the appropriate port
app.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Authentication service running on ${address}`);
});
```

**Notes:**

- The service uses CORS so that, if it were ever called directly, only requests from your allowed front‑end domains succeed.  
- Because your front‑end isn’t calling `https://auth.domain/...` directly but via a reverse proxy at `https://domain/api/auth`, the CORS check is still internally relevant (especially for cross-origin scenarios or direct access attempts).

---

## 3. Front‑End AJAX (Fetch) Example in TypeScript

Since you want to hide the backend endpoint, your front‑end code calls a relative URL (e.g., `/api/auth/login`):

```typescript
interface LoginPayload {
  email: string;
  password: string;
}

async function login(payload: LoginPayload): Promise<void> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // Send cookies if needed
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Login successful:', data.message, data.token);
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

**How It Looks to the User:**

- The browser sends a request to `https://domain/api/auth/login`.
- Traefik catches it, modifies the Host header (or performs any additional rewriting if needed) so that the request lands on your auth service.
- The user’s network activity never shows a request to `auth.domain` explicitly—the visible URL remains on your main domain.

---

## Final Thoughts

- **Unified Domain:** By having your front‑end use relative URLs (e.g. `/api/auth/...`), you hide the existence of a separate auth subdomain from the end user.
- **Reverse Proxy:** Traefik does the “magic” behind the scenes by rewriting the request (such as overriding the Host header), meaning the browser only sees requests to your unified domain.
- **Limitations:** Any network call is visible in Developer Tools, but the user will not directly see the internal routing details or the actual URL of the authentication service.

This hybrid configuration delivers a seamless user experience while keeping your authentication endpoints abstracted behind a unified domain. If you need further details—like multiple middlewares or additional path rewrites—feel free to ask!