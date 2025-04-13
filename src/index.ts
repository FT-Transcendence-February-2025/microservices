import './styles/style.css';

import Login from "./components/user/login/login.js"
import Register from "./components/user/register/register.js"
import NotFound from './components/menu/notFound/notFound.js';
import MainMenu from "./components/menu/mainMenu/mainMenu.js"
import PlayMenu from "./components/menu/playMenu/playMenu.js"
import TournamentMenu from "./components/menu/tournamentMenu/tournamentMenu.js"
import Avatar from "./components/user/avatar/avatar.js"
import Account from './components/user/account/account.js';
import Profile from './components/user/profile/profile.js';
import Game from "./components/game/game.js"
import Queue from "./components/menu/queue/queue.js"
import Friends from "./components/user/friends/friends.js"
import ChangePassword from "./components/user/account/changePassword/changePassword.js"
import User from "./utils/UserManager.js"
import Router from "./router.js"

const rootElement = document.getElementById('root');
if (!rootElement)
    throw new Error(`Root element not found!`);

const router = new Router(rootElement);

const isLoggedIn = () => { return User.isloggedIn };

router.addRoute({
    path: '/',
    view: [],
    preHandler: () => { return false },
    redirectOnFail: '/home'
});
router.addRoute({
    path: '/login',
    view: [Login]
});
router.addRoute({
    path: '/register',
    view: [Register]
});
router.addRoute({
    path: '/home',
    view: [MainMenu, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/play',
    view: [PlayMenu, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/tournament',
    view: [TournamentMenu, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/game',
    view: [Game],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/queue',
    view: [Queue],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/profile',
    view: [Profile, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/account',
    view: [Account, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/change-password',
    view: [ChangePassword, Avatar],
    preHandler: isLoggedIn,
    redirectOnFail: '/login'
});
router.addRoute({
    path: '/friends',
    view: [Friends, Avatar],
    preHandler: isLoggedIn, 
    redirectOnFail: '/login'
});

router.setNotFound([NotFound]);

router.init();

User.checkAndRestoreSession();