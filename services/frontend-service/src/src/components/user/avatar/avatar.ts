import avatarTemplate from './avatar.html?raw';

const template = document.createElement('template');
template.innerHTML = avatarTemplate;

export default class Avatar extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const avatarButton = this.querySelector('#avatarButton');
        const userDropdown = this.querySelector('#userDropdown');

        if (avatarButton && userDropdown)
        avatarButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
    }
}

customElements.define("avatar-icon", Avatar);