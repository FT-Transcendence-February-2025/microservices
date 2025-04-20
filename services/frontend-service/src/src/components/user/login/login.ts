import LoginTemplate from './login.html?raw';
import User from '../../../services/UserService';

const template = document.createElement('template');
template.innerHTML = LoginTemplate;

export default class Login extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const loginForm = this.querySelector('#loginForm');
        if (loginForm)
            loginForm.addEventListener('submit', this._handleSubmit.bind(this));
    }

    private _handleSubmit(event: Event) {
        event.preventDefault();
        const email = (this.querySelector('#email') as HTMLInputElement).value;
        const password = (this.querySelector('#password') as HTMLInputElement).value;

        User.login(email, password)
        .then(success => {
            if (success)
                alert('Login successful');
            else
                alert(`Login failed`);
        });
    }
}

customElements.define("login-form", Login);