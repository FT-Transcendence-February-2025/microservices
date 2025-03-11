import Start from "./views/Start.js"
import Register from "./views/Register.js"
import Login from "./views/Login.js"
import Menu from "./views/Menu.js"
import Play from "./views/Play.js"

const navigateTo = (url: string) => {
    history.pushState(null, "", url);
    console.log("navTo: ", url);
    router();
};

(window as any).navigateTo = navigateTo;

const router = async () => {
    const routes = [
        { path: "/", view: Start },
        { path: "/register", view: Register },
        { path: "/login", view: Login },
        { path: "/menu", view: Menu },
        { path: "/menu/play", view: Play }
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

    const view = new (match.route as any).view();

    (document.getElementById("app") as HTMLElement).innerHTML = await view.getHtml();

    if (view.afterRender) {
        await view.afterRender();
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    router();
});