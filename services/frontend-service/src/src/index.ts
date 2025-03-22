import './styles/style.css';

import Login from "./components/user/login/login.js"
import Register from "./components/user/register/register.js"
import NotFound from './components/notFound/notFound.js';
import MainMenu from "./components/menu/mainMenu/mainMenu.js"
import PlayMenu from "./components/menu/playMenu/playMenu.js"
import TournamentMenu from "./components/menu/tournamentMenu/tournamentMenu.js"
import Avatar from "./components/user/avatar/avatar.js"
import Profile from './components/user/profile/profile.js';
import Game from "./components/game/game.js"
import Queue from "./components/menu/queue/queue.js"

import Router from "./router.js"

const rootElement = document.getElementById('root');
if (!rootElement)
    throw new Error(`Root element not found!`);

const router = new Router(rootElement);

router.addRoute({ path: '/', view: [Login] });
router.addRoute({ path: '/login', view: [Login] });
router.addRoute({ path: '/register', view: [Register] });
router.addRoute({ path: '/home', view: [MainMenu, Avatar] });
router.addRoute({ path: '/play', view: [PlayMenu, Avatar] });
router.addRoute({ path: '/tournament', view: [TournamentMenu, Avatar] });
router.addRoute({ path: '/game', view: [Game] });
router.addRoute({ path: '/queue', view: [Queue] });
router.addRoute({ path: '/profile', view: [Profile] })

router.setNotFound([NotFound]);

router.init();