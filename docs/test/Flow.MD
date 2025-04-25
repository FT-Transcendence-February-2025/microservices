Below is a consolidated, service‐by‐service list of the front‑end API requests—with details on the endpoint URL, HTTP method, authentication or other requirements, the expected request data, and what the client (front end) should expect back in response.

---

## 1. User Management Service (Frontend‑Accessible Endpoints)

These endpoints are primarily used by the front‑end app for user profile and social interactions. They all require JWT authentication (except where noted as “None”).

- **Upload Avatar**  
  - **Endpoint:** `/api/avatar`  
  - **Method:** POST  
  - **Requirements:** JWT authentication; accepts multipart file upload  
  - **Request Data:** A multipart form containing the file to upload  
  - **Expected Response:**  
    ```json
    {
      "success": "Avatar uploaded successfully",
      "filePath": "/path/to/avatar.jpg"
    }
    ```

- **Change Display Name**  
  - **Endpoint:** `/api/display-name`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "displayName": "newUsername"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "Display name changed"
    }
    ```  
  - **Error Scenario:** (e.g., if too short) may return an error JSON.

- **Get User Profile**  
  - **Endpoint:** `/api/profile/:displayName`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Request Data:** The `displayName` provided as a URL parameter  
  - **Expected Response:**  
    ```json
    {
      "success": "Found user profile",
      "displayName": "username",
      "avatarPath": "/path/to/avatar.jpg",
      "wins": 10,
      "loses": 5,
      "online": true,
      "matchHistory": [
        {
          "userDisplayName": "username",
          "opponentDisplayName": "opponent",
          "userScore": 10,
          "opponentScore": 5,
          "matchDate": "2023-06-15T14:30:00Z"
        }
      ]
    }
    ```

- **Get Friend List**  
  - **Endpoint:** `/api/get-friends`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:** A JSON object with a key `"friends"` containing an array of user objects; for example:  
    ```json
    {
      "success": "Returning users found (can be empty)",
      "friends": [
        {
          "id": 123,
          "displayName": "friend1",
          "avatarPath": "/path/to/avatar.jpg",
          "wins": 5,
          "loses": 3,
          "online": true
        }
      ]
    }
    ```

- **Send Friend Request**  
  - **Endpoint:** `/api/invite-friend`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "invitedDisplayName": "friendUsername"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "Invite request has been sent"
    }
    ```

- **Respond to Friend Request**  
  - **Endpoint:** `/api/respond-friend`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "invitingDisplayName": "requestorUsername",
      "accepted": true
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "Successfully responded to the request"
    }
    ```

- **Remove Friend**  
  - **Endpoint:** `/api/remove-friend`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "displayNameToRemove": "friendUsername"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "User friendUsername removed from friends"
    }
    ```

- **Get Block List**  
  - **Endpoint:** `/api/get-block-list`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:**  
    ```json
    {
      "success": "Returning list of blocked users (can be empty)",
      "blockedUsers": [
        {
          "id": 456,
          "displayName": "blockedUser",
          "avatarPath": "/path/to/avatar.jpg"
        }
      ]
    }
    ```

- **Block User**  
  - **Endpoint:** `/api/block-user`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "displayNameToBlock": "username"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "User has been blocked"
    }
    ```

- **Unblock User**  
  - **Endpoint:** `/api/unblock-user`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "displayNameToUnblock": "username"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "User username has been unblocked"
    }
    ```

- **WebSocket Connection**  
  - **Endpoint:** `/api/ws` (WebSocket protocol)  
  - **Requirements:** JWT token must be sent via the WebSocket message  
  - **Authentication Message:**  
    ```json
    {
      "type": "authenticate",
      "token": "JWT_TOKEN_HERE"
    }
    ```  
  - **Expected Behavior:** Once authenticated, the client should receive real‑time notifications (e.g., `"notification_friend_request"` with sender details) over the socket.

---

## 2. Authentication Service

These endpoints help manage token refresh, two‑factor authentication (2FA), and authenticator app setup.

- **Refresh Token**  
  - **Endpoint:** `/api/auth/refresh`  
  - **Method:** POST  
  - **Requirements:** A valid refresh token provided in the request  
  - **Request Data:**  
    ```json
    {
      "refreshToken": "your-refresh-token-here"
    }
    ```  
  - **Expected Response:** Likely a new access token or confirmation message.

- **Get 2FA Info**  
  - **Endpoint:** `/api/auth/two-factor-authentication/get-info`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:** JSON with information about 2FA settings (e.g., whether 2FA is enabled or the secret/QR details).

- **Remove Authenticator App**  
  - **Endpoint:** `/api/auth/two-factor-authentication/app/delete`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Expected Response:** A confirmation message indicating the authenticator app has been removed.

- **Setup Authenticator App**  
  - **Endpoint:** `/api/auth/two-factor-authentication/app/add`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Expected Response:** Likely returns configuration details (e.g., a secret and/or QR code) to set up the authenticator app.

- **Confirm Authenticator App**  
  - **Endpoint:** `/api/auth/two-factor-authentication/app/confirm`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "verificationCode": "123456"
    }
    ```  
  - **Expected Response:** A confirmation that 2FA has been successfully set up.

- **Resend 2FA Code**  
  - **Endpoint:** `/api/auth/two-factor-authentication/resend-code`  
  - **Method:** POST  
  - **Requirements:** Partial authentication (for users in the process of 2FA setup)  
  - **Expected Response:** A message indicating that a new 2FA code has been sent.

---

## 3. User Service

These endpoints handle phone number management and offer alternative endpoints for social lists.

- **Get Friends List**  
  - **Endpoint:** `/api/user/get-friends`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:** Similar to the friends list above—a JSON array of friend objects.

- **Get Block List**  
  - **Endpoint:** `/api/user/get-block-list`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:** A JSON list of blocked users.

- **Update Phone Number**  
  - **Endpoint:** `/api/user/update-phone`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "phoneNumber": "+1234567890",
      "countryCode": "US"
    }
    ```  
  - **Expected Response:** A success confirmation.

- **Delete Phone Number**  
  - **Endpoint:** `/api/user/delete-phone`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Expected Response:** A message confirming that the phone number has been deleted.

---

## 4. Tournament Service

These endpoints manage tournament-related actions from the front end.

- **Invite to Tournament**  
  - **Endpoint:** `/api/tournament/invite`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "tournamentId": "t12345",
      "invitees": ["user123", "user456", "user789"]
    }
    ```  
  - **Expected Response:** A confirmation message that invitations have been sent.

- **Create Tournament**  
  - **Endpoint:** `/api/tournament/create`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "name": "Weekend Championship",
      "format": "elimination",
      "maxPlayers": 8,
      "startTime": "2025-05-01T18:00:00Z",
      "gameMode": "standard",
      "isPrivate": false
    }
    ```  
  - **Expected Response:** A confirmation that the tournament was created (often with tournament details).

- **Join Tournament**  
  - **Endpoint:** `/api/tournament/join`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "tournamentId": "t12345"
    }
    ```  
  - **Expected Response:** A success message confirming the join.

---

## 5. Game Service

These endpoints support game operations such as matchmaking.

- **Start Matchmaking**  
  - **Endpoint:** `/api/game/queue/join`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Request Data:**  
    ```json
    {
      "gameMode": "standard",
      "ranked": true
    }
    ```  
  - **Expected Response:** A confirmation that matchmaking has started (with queue details).

- **Cancel Matchmaking**  
  - **Endpoint:** `/api/game/queue/leave`  
  - **Method:** POST  
  - **Requirements:** JWT authentication  
  - **Expected Response:** A success message indicating cancellation.

- **Get Game State**  
  - **Endpoint:** `/api/game/state/:gameId`  
  - **Method:** GET  
  - **Requirements:** JWT authentication and the requester must be a participant  
  - **Expected Response:** JSON data describing the current state of the game.

---

## 6. Match Service

Endpoints here provide match-related history and details.

- **Get Match History**  
  - **Endpoint:** `/api/match/history`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Query Parameters:** e.g., `?limit=10&offset=0&gameMode=standard`  
  - **Expected Response:** A JSON object containing an array of past matches with details like scores and dates.

- **Get Match Details**  
  - **Endpoint:** `/api/match/:matchId`  
  - **Method:** GET  
  - **Requirements:** JWT authentication  
  - **Expected Response:** Detailed JSON information for the specified match.

---

## 7. Backend-Accessible Endpoints

While these endpoints are mainly for service-to-service calls, they mirror many front‑end actions and may be indirectly triggered through the front end.

- **New User Registration**  
  - **Endpoint:** `/api/new-user`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "userId": 123,
      "displayName": "username"
    }
    ```  
  - **Expected Response:** A confirmation that the user has been created.

- **Check if User Exists**  
  - **Endpoint:** `/api/user-exists`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "displayName": "username"
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "exists": true
    }
    ```

- **User Logout**  
  - **Endpoint:** `/api/user-logout`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "userId": 123
    }
    ```  
  - **Expected Response:**  
    ```json
    {
      "success": "User status changed to offline"
    }
    ```

- **Get User Data (for other services)**  
  - **Endpoint:** `/api/get-user/:userId`  
  - **Method:** GET  
  - **Expected Response:** JSON with general user data (displayName, avatar, wins, loses, etc.).

- **Update Match History**  
  - **Endpoint:** `/api/update-match-history`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "userId": 123,
      "opponentId": 456,
      "userScore": 10,
      "opponentScore": 5,
      "matchDate": "2023-07-01T12:00:00Z"
    }
    ```  
  - **Expected Response:** A confirmation message that the match history was updated.

- **Invite User to Game**  
  - **Endpoint:** `/api/invite-game`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "invitingId": 123,
      "invitedId": 456
    }
    ```  
  - **Expected Response:** A notification that the invitation was successfully sent (with online status).

- **Invite Users to Tournament (Backend Version)**  
  - **Endpoint:** `/api/invite-tournament`  
  - **Method:** POST  
  - **Request Data:**  
    ```json
    {
      "tournamentId": 789,
      "tournamentName": "Summer Tournament",
      "invitingUserId": 123,
      "ids": [456, 789, 101]
    }
    ```  
  - **Expected Response:** A success message confirming the dispatch of tournament invitations.

- **Get User's Friend List for Tournament**  
  - **Endpoint:** `/api/get-user-friend-list/:userId`  
  - **Method:** GET  
  - **Expected Response:** JSON with a list of friends (similar to the general friend list).

---

## 8. Frontend Routes (HTML Pages)

While not API requests per se, these routes are the pages requested by users in the browser:

- **Public Routes (No Authentication Required):**  
  - `/` (redirects to home)  
  - `/login` (login page)  
  - `/register` (registration page)  
  - `/login/two-factor-authentication/verify` (2FA verification page)

- **Protected Routes (Authentication Required):**  
  - `/home` (main dashboard with avatar)  
  - `/play` (game play menu)  
  - `/game` (active game screen)  
  - `/queue` (matchmaking queue)  
  - `/profile` (user profile page)  
  - `/tournament` (tournament menu)  
  - `/tournament/host` (tournament hosting interface)  
  - `/settings`, `/account`, `/email`, `/password` (account management pages)  
  - `/two-factor-authentication` & `/authenticator-app-qr-code` (2FA management)  
  - `/friends` (friends management)  
  - `/block-list` (blocked users management)


---
