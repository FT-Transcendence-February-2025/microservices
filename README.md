# frontend service

======= TO-DO =======:

- add cleanup funtions to the classes if they have eventlisteners and stuff to clean
- if (currentView && currentView.cleanup) {
        currentView.cleanup(); // Call cleanup on the previous view
    }

menu:
- responsiveness
- add avatar and user menu
- own starfield background for menu (https://www.gimpusers.com/tutorials/starfield-tutorial)
- own logo for menu (https://graphicdesign.stackexchange.com/questions/77527/how-to-make-retro-80s-chrome-text-in-gimp)
- own game background animation
- add font-['Press_Start_2P']
- menu music?

game:
- add local game logic
- not render on every package from server, but render at 60 fps and predict ball position and stuff
- add sounds ? more impact (screen shake, particles)
- add waiting for opponent screen (game won/lost screen ?)

views:
- start (register, login)
    - register
    - login
- menu (play, tournament)
    - play (local, remote, back)
        - remote (create, join, back)
            - join
    - tournament (create, join, back)
        - create
        - join
- user
- game

Guide:
https://dev.to/dcodeyt/building-a-single-page-app-without-frameworks-hl9
https://www.youtube.com/watch?v=OstALBk-jTc