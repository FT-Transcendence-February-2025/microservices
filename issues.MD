# ISSUES

1. AUTHENTICATION FLOW
   /login → POST /api/login → Redirect to /home
   /register → POST /api/register → Redirect to /login

2. MAIN MENU FLOW
   /home → GET /api/profile → Render MainMenu + Avatar

3. PLAY MENU FLOW
   /play → GET /api/matchmaking → Render PlayMenu + Avatar

4. TOURNAMENT FLOW
   /tournament → GET /api/tournaments → Render TournamentMenu + Avatar
   /tournament/host → POST /api/tournament/host → Render TournamentHost + Avatar

5. GAME FLOW
   /game → WebSocket: wss://domain/api/game → Render Game

6. USER MANAGEMENT FLOW
   /profile → GET /api/profile → Render Profile + Avatar
   /settings → GET /api/settings → Render Settings + Avatar
   /account → GET /api/account → Render Account + Avatar
   /friends → GET /api/friends → Render Friends + Avatar
   /block-list → GET /api/block-list → Render BlockList + Avatar

7. SECURITY FLOW
   /two-factor-authentication → POST /api/two-factor-authentication → Render TwoFactorAuthentication
   /authenticator-app-qr-code → GET /api/two-factor-authentication/app → Render AuthenticatorAppQRCode
   /login/two-factor-authentication/verify → POST /api/login/two-factor-authentication → Render VerifyTwoFactorAuthentication

8. PASSWORD AND EMAIL MANAGEMENT
   /password → POST /api/password → Render ChangePassword + Avatar
   /email → POST /api/email → Render ChangeEmail + Avatar

9. QUEUE FLOW
   /queue → POST /api/matchmaking → Render Queue
