import AbstractView from "./AbstractView.js";
import MenuView from "./MenuView.js";
import LoginView from "./LoginView.js";
import RegisterView from "./RegisterView.js";
import AuthenticationView from "./AuthenticationView.js";
import UserView from "./UserView.js"
import GameView from "./GameView.js";

export default class Router {
    private authenticationView: AuthenticationView;
    private menuView: MenuView;
    private loginView: LoginView;
    private registerView: RegisterView;
    private userView: UserView;
    private gameView: GameView;
    private currentView: AbstractView;
    private routes: Map<string, AbstractView>;

    constructor() {
        this.authenticationView = new AuthenticationView(this);
        this.menuView = new MenuView(this);
        this.loginView = new LoginView(this);
        this.registerView = new RegisterView(this);
        this.userView = new UserView(this);
        this.gameView = new GameView(this);
        this.currentView = this.authenticationView;
        this.routes = new Map<string, AbstractView>([
            ["/", this.authenticationView],
            ["/login", this.loginView],
            ["/register", this.registerView],
            ["/menu", this.menuView],
            ["/user", this.userView],
            ["/game", this.gameView]
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

        // Get new view
        let newView = this.routes.get(location.pathname);
        if (!newView)
            newView = this.menuView;

        // Clean previous view
        this.currentView.clean();
        
        // Get HTML code and init view
        app.innerHTML = await newView.getHtml();
        newView.init();

        // Update currenView
        this.currentView = newView;
    }
}