# frontend service

<=== TO DO ===>

APIManager:         // redirect to /login and delete tokens !!!
User:               // remove refresh token cookie !!!

components:
- root component  // checks if user is logged in and redirects to either login or home (fetches the user data)
- game:
    - touch logic with local game (two player one phone)
    - not render on every package from server, but render at 60 fps and predict ball position and stuff
- profile
    - add avatart change logic
    - add password change button

- statistics view
- tournament create view
- torunament join view
- torunament lobby
- friend list

- home button ? or navbar?
- fullscreen button


other:
- add Local font files
- try implement static asset handling with vite


design:
- own starfield background image (https://www.gimpusers.com/tutorials/starfield-tutorial)
- own logo for menu (https://graphicdesign.stackexchange.com/questions/77527/how-to-make-retro-80s-chrome-text-in-gimp)
- own game background animation
- menu music ?
- favicon