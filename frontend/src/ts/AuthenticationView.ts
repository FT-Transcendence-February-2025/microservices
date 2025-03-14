import AbstractView from "./AbstractView.js";
import type Router from "./Router.js"

export default class AuthenticationView extends AbstractView {
    constructor(router: Router) {
        super(router);
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <img src="/images/logo.png" alt="Logo" class="h-52 w-auto">
        
                <div class="flex flex-col space-y-4">
                    <button id="loginButton" class="btn-primary">Login</button>
                    <button id="registerButton" class="btn-primary">Register</button>
                </div>
            </div>
        </div>
        `;
    }

    init () {
        const loginButton: HTMLElement | null = document.getElementById('loginButton');
        const registerButton: HTMLElement | null = document.getElementById('registerButton');

        if (loginButton) {
            loginButton.addEventListener("click", () => {
                this.router.navigateTo('/login');
            });
        }

        if (registerButton) {
            registerButton.addEventListener("click", () => {
                this.router.navigateTo('/register');
            });
        }
    }

    clean () {

    }
}