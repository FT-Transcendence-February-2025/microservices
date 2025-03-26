import LoginTemplate from './login.html?raw';
import User from '../../../utils/User';

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
            loginForm.addEventListener('submit', this.handleSubmit.bind(this));
    }	

    async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();
        const email = (this.querySelector('#email') as HTMLInputElement).value;
        const password = (this.querySelector('#password') as HTMLInputElement).value;

        User.login(email, password)
        .then(response => {
            if (response.success)
                alert('Login successful');
            else
                alert(`Login failed: ${response.errorMessage}`);
        });
    }
}

customElements.define("login-form", Login);