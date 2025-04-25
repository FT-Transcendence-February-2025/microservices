
# Authentication Routes
Collecting workspace information# User Management Service API Endpoints

Below are all the API endpoints in the user management service, separated by access type with detailed request body requirements and examples.

## Frontend-accessible Endpoints (JWT Authentication Required)

### 1. Upload Avatar
- Endpoint: `/api/avatar`
- Method: `POST`
- Requirement: JWT Authentication, Multipart file upload
- Handler: `frontendController.avatarChange`
- Request Body: Multipart form with file upload
- Example Response:
  ```json
  {
    "success": "Avatar uploaded successfully",
    "filePath": "/path/to/avatar.jpg"
  }
  ```

### 2. Change Display Name
- Endpoint: `/api/display-name`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.displayName`
- Request Body:
  ```json
  {
    "displayName": "newUsername"
  }
  ```
- Example Response:
  ```json
  {
    "success": "Display name changed"
  }
  ```

### 3. Get User Profile
- Endpoint: `/api/profile/:displayName`
- Method: `GET`
- Requirement: JWT Authentication
- Handler: `frontendController.getUserProfile`
- Example Response:
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

### 4. Get Friend List
- Endpoint: `/api/get-friends`
- Method: `GET`
- Requirement: JWT Authentication
- Handler: `frontendController.getFriends`
- Example Response:
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

### 5. Send Friend Request
- Endpoint: `/api/invite-friend`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.inviteFriend`
- Request Body:
  ```json
  {
    "invitedDisplayName": "friendUsername"
  }
  ```
- Example Response:
  ```json
  {
    "success": "Invite request has been sent"
  }
  ```

### 6. Respond to Friend Request
- Endpoint: `/api/respond-friend`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.respondFriend`
- Request Body:
  ```json
  {
    "invitingDisplayName": "requestorUsername",
    "accepted": true
  }
  ```
- Example Response:
  ```json
  {
    "success": "Successfully responded to the request"
  }
  ```

### 7. Remove Friend
- Endpoint: `/api/remove-friend`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.removeFriend`
- Request Body:
  ```json
  {
    "displayNameToRemove": "friendUsername"
  }
  ```
- Example Response:
  ```json
  {
    "success": "User friendUsername removed from friends"
  }
  ```

### 8. Get Block List
- Endpoint: `/api/get-block-list`
- Method: `GET`
- Requirement: JWT Authentication
- Handler: `frontendController.getBlockList`
- Example Response:
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

### 9. Block User
- Endpoint: `/api/block-user`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.blockUser`
- Request Body:
  ```json
  {
    "displayNameToBlock": "username"
  }
  ```
- Example Response:
  ```json
  {
    "success": "User has been blocked"
  }
  ```

### 10. Unblock User
- Endpoint: `/api/unblock-user`
- Method: `POST`
- Requirement: JWT Authentication
- Handler: `frontendController.unblockUser`
- Request Body:
  ```json
  {
    "displayNameToUnblock": "username"
  }
  ```
- Example Response:
  ```json
  {
    "success": "User username has been unblocked"
  }
  ```

### 11. WebSocket Connection
- Endpoint: `/api/ws`
- Protocol: WebSocket
- Requirement: JWT Authentication (via message)
- Handler: `frontendController.websocketConnections`
- Authentication Message:
  ```json
  {
    "type": "authenticate",
    "token": "JWT_TOKEN_HERE"
  }
  ```
- Example Notifications Received:
  ```json
  {
    "type": "notification_friend_request",
    "invitingUser": {
      "id": 123,
      "displayName": "username"
    }
  }
  ```

## Backend-accessible Endpoints (No JWT Authentication)

### 1. New User Registration
- Endpoint: `/api/new-user`
- Method: `POST`
- Requirement: None
- Handler: `authenticationController.newUser`
- Request Body:
  ```json
  {
    "userId": 123,
    "displayName": "username"
  }
  ```
- Example Response:
  ```json
  {
    "success": "User created"
  }
  ```

### 2. Check if User Exists
- Endpoint: `/api/user-exists`
- Method: `POST`
- Requirement: None
- Handler: `authenticationController.userExists`
- Request Body:
  ```json
  {
    "displayName": "username"
  }
  ```
- Example Response:
  ```json
  {
    "exists": true
  }
  ```

### 3. User Logout
- Endpoint: `/api/user-logout`
- Method: `POST`
- Requirement: None
- Handler: `authenticationController.makeUserOffline`
- Request Body:
  ```json
  {
    "userId": 123
  }
  ```
- Example Response:
  ```json
  {
    "success": "User status changed to offline"
  }
  ```

### 4. Get User Data (for other services)
- Endpoint: `/api/get-user/:userId`
- Method: `GET`
- Requirement: None
- Handler: `commonBackendController.getUser`
- Example Response:
  ```json
  {
    "success": "Found user profile",
    "displayName": "username",
    "avatarPath": "/path/to/avatar.jpg",
    "wins": 10,
    "loses": 5,
    "online": true
  }
  ```

### 5. Get Match History
- Endpoint: `/api/get-match-history/:userId`
- Method: `GET`
- Requirement: None
- Handler: `matchmakingController.getMatchHistory`
- Example Response:
  ```json
  {
    "success": "Sending user's match history",
    "matches": [
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

### 6. Update Match History
- Endpoint: `/api/update-match-history`
- Method: `POST`
- Requirement: None
- Handler: `matchmakingController.updateMatchHistory`
- Request Body:
  ```json
  {
    "userId": 123,
    "opponentId": 456,
    "userScore": 10,
    "opponentScore": 8,
    "matchDate": "2023-06-15T14:30:00Z"
  }
  ```
- Example Response:
  ```json
  {
    "success": "Match history updated"
  }
  ```

### 7. Invite to Game
- Endpoint: `/api/invite-game`
- Method: `POST`
- Requirement: None
- Handler: `matchmakingController.inviteUserToGame`
- Request Body:
  ```json
  {
    "invitingId": 123,
    "invitedId": 456
  }
  ```
- Example Response:
  ```json
  {
    "success": "User is online",
    "invitationSent": true
  }
  ```

### 8. Invite to Tournament
- Endpoint: `/api/invite-tournament`
- Method: `POST`
- Requirement: None
- Handler: `tournamentController.sendTournamentInvitations`
- Request Body:
  ```json
  {
    "tournamentId": 789,
    "tournamentName": "Summer Cup",
    "invitingUserId": 123,
    "ids": [456, 789]
  }
  ```
- Example Response:
  ```json
  {
    "success": "Sent tournament invitations to online users"
  }
  ```

### 9. Get User's Friends for Tournament
- Endpoint: `/api/get-user-friend-list/:userId`
- Method: `GET`
- Requirement: None
- Handler: `tournamentController.getUserFriendList`
- Example Response:
  ```json
  {
    "success": "Returning users found (can be empty)",
    "friends": [
      {
        "id": 456,
        "displayName": "friend1",
        "avatarPath": "/path/to/avatar.jpg",
        "wins": 5,
        "loses": 3,
        "online": true
      }
    ]
  }
  ```

### 10. Metrics Endpoint
- Endpoint: `/metrics`
- Method: `GET`
- Requirement: None
- Purpose: Prometheus metrics collection
- Response: Plain text metrics data


#---------------------------------------------------------------------------------

# Frontend Routes

### Public Routes (No Authentication Required)
- **/** - Default route, redirects to home page
- **/login** - User login page
- **/register** - User registration page  
- **/login/two-factor-authentication/verify** - 2FA verification during login process

### Protected Routes (Authentication Required)
All require authentication and redirect to `/login` if not authenticated:

#### Main Application Areas
- **/home** - Main menu dashboard with avatar
- **/play** - Game play menu with avatar
- **/game** - Active game screen
- **/queue** - Game matchmaking queue screen
- **/profile** - User profile page with avatar
- **/tournament** - Tournament menu with avatar
- **/tournament/host** - Tournament hosting interface

#### User Management
- **/settings** - Settings page with avatar
- **/account** - Account management with avatar
- **/email** - Email change page with avatar
- **/password** - Password change page with avatar
- **/two-factor-authentication** - 2FA setup and management
- **/authenticator-app-qr-code** - QR code for authenticator app setup
- **/friends** - Friends management interface
- **/block-list** - Blocked users management

## API Endpoints By Service

### Authentication Service

#### Refresh Token
- **Endpoint**: `/api/auth/refresh`
- **Method**: POST
- **Requirements**: Valid refresh token
- **Body**:
  ```json
  {
    "refreshToken": "your-refresh-token-here"
  }
  ```
- **Handler**: authController.refreshToken

#### Get 2FA Info
- **Endpoint**: `/api/auth/two-factor-authentication/get-info`
- **Method**: GET
- **Requirements**: Authentication required
- **Handler**: authController.getTwoFactorAuthInfo

#### Remove Authenticator App
- **Endpoint**: `/api/auth/two-factor-authentication/app/delete`
- **Method**: POST
- **Requirements**: Authentication required
- **Handler**: authController.removeTwoFactorAuth

#### Setup Authenticator App
- **Endpoint**: `/api/auth/two-factor-authentication/app/add`
- **Method**: POST
- **Requirements**: Authentication required
- **Handler**: authController.setupTwoFactorAuth

#### Confirm Authenticator App
- **Endpoint**: `/api/auth/two-factor-authentication/app/confirm`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
  ```json
  {
    "verificationCode": "123456"
  }
  ```
- **Handler**: authController.confirmTwoFactorAuth

#### Resend 2FA Code
- **Endpoint**: `/api/auth/two-factor-authentication/resend-code`
- **Method**: POST
- **Requirements**: Partial authentication
- **Handler**: authController.resendTwoFactorCode

### User Service

#### Get Friends List
- **Endpoint**: `/api/user/get-friends`
- **Method**: GET
- **Requirements**: Authentication required
- **Handler**: userController.getFriendsList

#### Get Block List
- **Endpoint**: `/api/user/get-block-list`
- **Method**: GET
- **Requirements**: Authentication required
- **Handler**: userController.getBlockList

#### Update Phone Number
- **Endpoint**: `/api/user/update-phone`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
  ```json
  {
    "phoneNumber": "+1234567890",
    "countryCode": "US"
  }
  ```
- **Handler**: userController.updatePhoneNumber

#### Delete Phone Number
- **Endpoint**: `/api/user/delete-phone`
- **Method**: POST
- **Requirements**: Authentication required
- **Handler**: userController.deletePhoneNumber

### Tournament Service

#### Invite to Tournament
- **Endpoint**: `/api/tournament/invite`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
  ```json
  {
    "tournamentId": "t12345",
    "invitees": ["user123", "user456", "user789"]
  }
  ```
- **Handler**: tournamentController.sendTournamentInvitations

#### Create Tournament
- **Endpoint**: `/api/tournament/create`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
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
- **Handler**: tournamentController.createTournament

#### Join Tournament
- **Endpoint**: `/api/tournament/join`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
  ```json
  {
    "tournamentId": "t12345"
  }
  ```
- **Handler**: tournamentController.joinTournament

### Game Service

#### Start Matchmaking
- **Endpoint**: `/api/game/queue/join`
- **Method**: POST
- **Requirements**: Authentication required
- **Body**:
  ```json
  {
    "gameMode": "standard",
    "ranked": true
  }
  ```
- **Handler**: gameController.joinQueue

#### Cancel Matchmaking
- **Endpoint**: `/api/game/queue/leave`
- **Method**: POST
- **Requirements**: Authentication required
- **Handler**: gameController.leaveQueue

#### Get Game State
- **Endpoint**: `/api/game/state/:gameId`
- **Method**: GET
- **Requirements**: Authentication required, participant in game
- **Handler**: gameController.getGameState

### Match Service

#### Get Match History
- **Endpoint**: `/api/match/history`
- **Method**: GET
- **Requirements**: Authentication required
- **Query Parameters**: `?limit=10&offset=0&gameMode=standard`
- **Handler**: matchController.getMatchHistory

#### Get Match Details
- **Endpoint**: `/api/match/:matchId`
- **Method**: GET
- **Requirements**: Authentication required
- **Handler**: matchController.getMatchDetails

# -----------------------------------------------------------------------------------------------------------------------
# USER MANAGEMENT

## Frontend Accessible Endpoints

These endpoints are accessible from the frontend application and most require JWT authentication.

### Authentication Endpoints

#### 1. User Logout
- **URL**: `/user-logout`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "userId": 123
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User status changed to offline"
  }
  ```

### User Profile Endpoints

#### 1. Change Display Name
- **URL**: `/display-name`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "displayName": "new_username"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "Display name changed"
  }
  ```
- **Response (400)**:
  ```json
  {
    "error": "Display name too short (min 4 characters)"
  }
  ```

#### 2. Upload Avatar
- **URL**: `/avatar`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request**: Multipart form data with file
- **Response (200)**:
  ```json
  {
    "success": "Avatar uploaded successfully",
    "filePath": "/path/to/avatar.png"
  }
  ```
- **Response (400)**:
  ```json
  {
    "error": "Invalid file type. Only JPG, JPEG, PNG are allowed."
  }
  ```

#### 3. Get User Profile
- **URL**: `/profile/:displayName`
- **Method**: `GET`
- **Authentication**: JWT Required
- **Response (200)**:
  ```json
  {
    "success": "Found user profile",
    "displayName": "username",
    "avatarPath": "/path/to/avatar.png",
    "wins": 10,
    "loses": 5,
    "online": true,
    "matchHistory": [
      {
        "userDisplayName": "username",
        "opponentDisplayName": "opponent",
        "userScore": 10,
        "opponentScore": 5,
        "matchDate": "2023-07-01T12:00:00Z"
      }
    ]
  }
  ```

### Social Endpoints

#### 1. Get Friends
- **URL**: `/get-friends`
- **Method**: `GET`
- **Authentication**: JWT Required
- **Response (200)**:
  ```json
  {
    "success": "Returning users found (can be empty)",
    "friends": [
      {
        "id": 123,
        "displayName": "friend_name",
        "avatarPath": "/path/to/avatar.png",
        "wins": 5,
        "loses": 2,
        "online": true
      }
    ]
  }
  ```

#### 2. Invite Friend
- **URL**: `/invite-friend`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "invitedDisplayName": "friend_username"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "Invite request has been sent"
  }
  ```

#### 3. Respond to Friend Request
- **URL**: `/respond-friend`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "invitingDisplayName": "requesting_username",
    "accepted": true
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "Successfully responded to the request"
  }
  ```

#### 4. Remove Friend
- **URL**: `/remove-friend`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "displayNameToRemove": "friend_username"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User friend_username removed from friends"
  }
  ```

#### 5. Block User
- **URL**: `/block-user`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "displayNameToBlock": "username_to_block"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User has been blocked"
  }
  ```

#### 6. Unblock User
- **URL**: `/unblock-user`
- **Method**: `POST`
- **Authentication**: JWT Required
- **Request Body**:
  ```json
  {
    "displayNameToUnblock": "username_to_unblock"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User username_to_unblock has been unblocked"
  }
  ```

#### 7. Get Block List
- **URL**: `/get-block-list`
- **Method**: `GET`
- **Authentication**: JWT Required
- **Response (200)**:
  ```json
  {
    "success": "Returning list of blocked users (can be empty)",
    "blockedUsers": [
      {
        "id": 456,
        "displayName": "blocked_user",
        "avatarPath": "/path/to/avatar.png"
      }
    ]
  }
  ```

### WebSocket Connection
- **URL**: `/ws`
- **Method**: `GET` (WebSocket)
- **Authentication**: Requires sending token via WebSocket message
- **Example Authentication Message**:
  ```json
  {
    "type": "authenticate", 
    "token": "jwt_token_here"
  }
  ```

## Backend-Only Endpoints

These endpoints are meant to be used by other microservices in the backend.

### User Management

#### 1. Create New User
- **URL**: `/new-user`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userId": 123,
    "displayName": "username"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User created"
  }
  ```

#### 2. Check if User Exists
- **URL**: `/user-exists`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "displayName": "username"
  }
  ```
- **Response (200)**:
  ```json
  {
    "exists": true
  }
  ```

#### 3. Get User by ID
- **URL**: `/get-user/:userId`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "success": "Found user profile",
    "displayName": "username",
    "avatarPath": "/path/to/avatar.png",
    "wins": 5,
    "loses": 2,
    "online": true
  }
  ```

### Matchmaking/Game Endpoints

#### 1. Get Match History
- **URL**: `/get-match-history/:userId`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "success": "Sending user's match history",
    "matches": [
      {
        "userDisplayName": "username",
        "opponentDisplayName": "opponent",
        "userScore": 10,
        "opponentScore": 5,
        "matchDate": "2023-07-01T12:00:00Z"
      }
    ]
  }
  ```

#### 2. Update Match History
- **URL**: `/update-match-history`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userId": 123,
    "opponentId": 456,
    "userScore": 10,
    "opponentScore": 5,
    "matchDate": "2023-07-01T12:00:00Z"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "Match history updated"
  }
  ```

#### 3. Invite User to Game
- **URL**: `/invite-game`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "invitingId": 123,
    "invitedId": 456
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "User is online",
    "invitationSent": true
  }
  ```

### Tournament Endpoints

#### 1. Invite Users to Tournament
- **URL**: `/invite-tournament`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "tournamentId": 789,
    "tournamentName": "Summer Tournament",
    "invitingUserId": 123,
    "ids": [456, 789, 101]
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": "Sent tournament invitations to online users"
  }
  ```

#### 2. Get User's Friend List for Tournament
- **URL**: `/get-user-friend-list/:userId`
- **Method**: `GET`
- **Response (200)**:
  ```json
  {
    "success": "Returning users found (can be empty)",
    "friends": [
      {
        "id": 456,
        "displayName": "friend_name",
        "avatarPath": "/path/to/avatar.png",
        "wins": 5,
        "loses": 2,
        "online": true
      }
    ]
  }
  ```
# -----------------------------------------------------------------------------------------------------------
# TOURNAMENT

# -----------------------------------------------------------------------------------------------------------
# 

# -----------------------------------------------------------------------------------------------------------
# GAME