type Route = {
    path: string;
    view: CustomElementConstructor[];
    preHandler?: () => boolean;
    redirectOnFail?: string;
}

export default class Router {
    private _routes: Route[];
    private _root: HTMLElement | null;
    private _notFound: CustomElementConstructor[] | null;

    constructor(rootElement: HTMLElement) {
        this._routes = [];
        this._notFound = null;
        this._root = rootElement;
    }

    private _route(): void {
        if (!this._root) {
            console.warn("Root element not initialized");
            return;
        }

        this._root.innerHTML = "";
    
        const matchedRoute = this._routes.find(route => route.path === location.pathname);
    
        if (matchedRoute && matchedRoute.preHandler && !matchedRoute.preHandler()) {
            const redirectPath = matchedRoute.redirectOnFail;

            if (redirectPath)
                this.navigateTo(redirectPath);
            else
                this._root.innerHTML = "<h1>403</h1><p>Forbidden</p>";
            return;
        }

        const view = matchedRoute ? matchedRoute.view : this._notFound;
        if (!view) {
            this._root.innerHTML = "<h1>404</h1><p>Not Found</p>";
            return;
        }

        view.forEach(Component => {
            this._root!.appendChild(new Component());
        });
        this._addLinkEventListener();
    }

    private _addLinkEventListener() : void {
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
                if (href)
                    this.navigateTo(href);
            });
        });
    }    

    addRoute(route: Route) : void {
        if (this._routes.some(r => r.path === route.path))
            return console.warn(`Route: ${route.path} already exists!`);
        else
            this._routes.push(route);
    }

    setNotFound(notFound: CustomElementConstructor[]) : void {
        this._notFound = notFound;
    }

    navigateTo(url: string) : void {
        history.pushState(null, "", url);
        this._route();
    }

    /*
    Adds navigateTo function to the window objecto to naviagte to another route
    */
    init() : void {
        window.addEventListener('popstate', () => {
            this._route();
        });
        this._route();
        // @ts-ignore
        window.navigateTo = this.navigateTo.bind(this);
    }
}