import Start from "./views/Start.js"
import Register from "./views/Register.js"
import Login from "./views/Login.js"
import Menu from "./views/Menu.js"
// import Play from "./views/Play.js"
import Game from "./views/Game.js"
// import Tournament from "./views/Tournament.js"

const navigateTo = (url: string) => {
    history.pushState(null, "", url);
    console.log("navTo: ", url);
    router();
};

(window as any).navigateTo = navigateTo;

const MenuInstance = new Menu();

const router = async () => {
    const routes = [
        { path: "/", view: Start },
        { path: "/register", view: Register },
        { path: "/login", view: Login },
        { path: "/menu" , view: MenuInstance },
        { path: "/game", view: Game }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        }
    }
    
    let view;
    if (typeof match.route.view === "object") {
        // Use the preallocated instance directly
        view = match.route.view;
        console.log("found")
    } else {
        // Instantiate a new instance for class-based views
        view = new (match.route.view as any)();
    }

    // const view = new (match.route as any).view();
    console.log(view.getHtml());
    (document.getElementById("app") as HTMLElement).innerHTML = await view.getHtml();

    if (view.afterRender) {
        await view.afterRender();
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    router();
});