import './styles/style.css';

import NavBar from './components/navBar/navBar.js';
import NotFound from './components/notFound/notFound.js';
import Home from './components/home/home.js';
import Login from "./components/login/login.js"
import Register from "./components/register/register.js"
import PlayMenu from "./components/playMenu/playMenu.js"
import Avatar from "./components/avatar/avatar.js"
import Game from "./components/game/game.js"
import Profile from './components/profile/profile.js';

import Router from "./router.js"

const rootElement = document.getElementById('root');
if (!rootElement)
    throw new Error(`Root element not found!`);

const router = new Router(rootElement);

router.addRoute({ path: '/', view: [Login] });
router.addRoute({ path: '/login', view: [Login] });
router.addRoute({ path: '/register', view: [Register] });
router.addRoute({ path: '/home', view: [NavBar, Home, Avatar] });
router.addRoute({ path: '/play', view: [NavBar, PlayMenu, Avatar] });
router.addRoute({ path: '/tournament', view: [NavBar, Avatar] });
router.addRoute({ path: '/settings', view: [NavBar, Avatar] });
router.addRoute({ path: '/game', view: [Game] });
router.addRoute({ path: '/profile', view: [Profile] })

router.setNotFound([NotFound]);

router.init();