import RegisterTemplate from './register.html?raw';
import User from '../../../utils/User';

const template = document.createElement('template');
template.innerHTML = RegisterTemplate;

export default class Register extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const registerForm = this.querySelector("#registerForm");
        if (registerForm)
            registerForm.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();
        const displayName = (this.querySelector('#displayName') as HTMLInputElement).value; 
        const email = (this.querySelector('#email') as HTMLInputElement).value;
        const password = (this.querySelector('#password') as HTMLInputElement).value;

        User.register(displayName, email, password)
        .then(response => {
            if (response.success)
                alert('Login successful');
            else
                alert(`Login failed: ${response.errorMessage}`);
        });
    }
}

customElements.define("register-form", Register);