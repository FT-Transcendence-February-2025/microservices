# frontend service

<=== TO DO ===>
APIManager:         // redirect to /login and delete tokens !!!
User:               // remove refresh token cookie !!!

components:
- root component  // checks if user is logged in and redirects to either login or home (fetches the user data)
- prehandler for router to check if an route should be accessable (is logged in)

- profile
    - add avatar change logic
    - add password change button

- tournament create view
- torunament join view
- torunament lobby
- friend list

- login after register?

- fullscreen button in avatar component?

- game:
    - touch logic with local game (two player one phone)

other:
- add Local font files
- try implement static asset handling with vite
- login after register?

design:
- own starfield background image (https://www.gimpusers.com/tutorials/starfield-tutorial)
- own logo for menu (https://graphicdesign.stackexchange.com/questions/77527/how-to-make-retro-80s-chrome-text-in-gimp)
- own game background animation
- menu music ?
- favicon