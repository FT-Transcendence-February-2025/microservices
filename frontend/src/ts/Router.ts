import IView from "./AbstractView.js";
import MenuView from "./MenuView.js";
import LoginView from "./LoginView.js";
import RegisterView from "./RegisterView.js";
import AuthenticationView from "./AuthenticationView.js";

export default class Router {
    private authenticationView: AuthenticationView;
    private menuView: MenuView;
    private loginView: LoginView;
    private registerView: RegisterView;
    private currentView: IView | null;
    private routes: Map<string, IView>;

    constructor() {
        this.authenticationView = new AuthenticationView(this);
        this.menuView = new MenuView(this);
        this.loginView = new LoginView(this);
        this.registerView = new RegisterView(this);
        this.currentView = null;
        this.routes = new Map<string, IView>([
            ["/", this.authenticationView],
            ["/login", this.loginView],
            ["/register", this.registerView],
            ["/menu", this.menuView],
        ]);
    }

    navigateTo(url: string) {
        history.pushState(null, "", url);
        this.route();
    }

    async route() {
        // Get app HTMLElement
        const app: HTMLElement | null = document.getElementById("app");
        if (!app)
            return console.error("App element not found");

        // Find new view
        let newView = this.routes.get(location.pathname);
        if (!newView)
            newView = this.menuView;

        // Clean previous view and set currentView
        if (this.currentView)
            this.currentView.clean();
        this.currentView = newView;

        app.innerHTML = await newView.getHtml();
        newView.init();
    }
}