import RegisterTemplate from './register.html?raw';
import User from '../../../services/UserService';

const template = document.createElement('template');
template.innerHTML = RegisterTemplate;

export default class Register extends HTMLElement {
    private _displayNameInput: HTMLInputElement;
    private _emailInput: HTMLInputElement;
    private _passwordInput: HTMLInputElement;
    private _confirmPasswordInput: HTMLInputElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._displayNameInput = this.querySelector('#displayName') as HTMLInputElement;
        if (!this._displayNameInput)
            throw new Error("Could not find displayName element");
        this._emailInput = this.querySelector('#email') as HTMLInputElement;
        if (!this._emailInput)
            throw new Error("Could not find email element");
        this._passwordInput = this.querySelector('#password') as HTMLInputElement;
        if (!this._passwordInput)
            throw new Error("Could not find password element");
        this._confirmPasswordInput = this.querySelector('#confirmPassword') as HTMLInputElement;
        if (!this._confirmPasswordInput)
            throw new Error("Could not find confirmPassword element");
    }

    connectedCallback() {
        const registerForm = this.querySelector("#registerForm");
        if (registerForm)
            registerForm.addEventListener('submit', this._handleSubmit.bind(this));
    }

    private _handleSubmit(event: Event) {
        event.preventDefault();
        const displayName = this._displayNameInput.value; 
        const email = this._emailInput.value;
        const password = this._passwordInput.value;
        const confirmPassword = this._confirmPasswordInput.value;


        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        User.register(displayName, email, password)
        .then(success => {
            if (success) {
                // @ts-ignore
                window.navigateTo('/login');
                alert('Register successful');
            }
            else {
                alert(`Register failed`);
            }
        });
    }
}

customElements.define("register-form", Register);