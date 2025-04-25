# User Management Service API Routes Separation

## Public Endpoints (Frontend Accessible)

These endpoints should be exposed to the frontend and secured with JWT authentication where needed.

```
/api/user/auth/logout                 - User Logout
/api/user/display-name        - Change Display Name
/api/user/avatar              - Upload Avatar
/api/user/:displayName        - Get User Profile
/api/user/friends              - Get Friends
/api/user/invite-friend        - Invite Friend
/api/user/respond-friend       - Respond to Friend Request
/api/user/remove-friend        - Remove Friend
/api/user/block-user           - Block User
/api/user/unblock-user         - Unblock User
/api/user/block-list           - Get Block List
/api/user/ws                          - WebSocket Connection
```

## Internal Endpoints (Backend-Only)

These endpoints should be restricted to internal service communication only and not accessible from the frontend.

```
/api/user/new-user           - Create New User
/api/user/user-exists        - Check if User Exists
/api/user/get-user/:userId   - Get User by ID
/api/user/match-history/:userId - Get Match History
/api/user/update-match-history  - Update Match History
/api/user/invite-game        - Invite User to Game
/api/user/invite-tournament  - Invite Users to Tournament
/api/user/friend-list/:userId - Get User's Friend List for Tournament
```

## Traefik Configuration Example

Here's a sample Traefik configuration that you can implement to restrict access to internal endpoints:

```yaml
# Rules to protect internal endpoints
http:
  routers:
    internal-user-service:
      rule: "Host(`your-domain.com`) && PathPrefix(`/api/internal/user`)"
      service: user-management-service
      middleware: internal-whitelist
  
  middlewares:
    internal-whitelist:
      ipWhiteList:
        sourceRange:
          - "10.0.0.0/8"  # Example: Internal network addresses
          - "172.16.0.0/12"  # Docker network
          - "192.168.0.0/16"  # Local network

    # Public endpoints router (no IP restrictions)
    public-user-service:
      rule: "Host(`your-domain.com`) && PathPrefix(`/api/user`)"
      service: user-management-service
```

This configuration ensures that paths beginning with `/api/internal/user` are only accessible from whitelisted internal IP addresses, while `/api/user` paths remain accessible for frontend clients.