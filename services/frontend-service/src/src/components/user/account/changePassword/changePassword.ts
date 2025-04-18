import changePasswordTempalte from './changePassword.html?raw';

const template = document.createElement('template');
template.innerHTML = changePasswordTempalte;

export default class ChangePassword extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("change-password", ChangePassword);