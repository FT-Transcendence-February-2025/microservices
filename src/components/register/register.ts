import RegisterTemplate from './register.html?raw';

const template = document.createElement('template');
template.innerHTML = RegisterTemplate;

export default class Register extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("register-form", Register);