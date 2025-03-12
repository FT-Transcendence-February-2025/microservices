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