import avatarTemplate from './avatar.html?raw';
import User from './../../..//utils/User.js'

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
        const displayName = this.querySelector('#displayName');

        if (displayName)
            displayName.textContent = User.displayName;

        if (avatarButton && userDropdown)
        avatarButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
        const logoutLink = this.querySelector('#logoutLink');
        if (logoutLink)
            logoutLink.addEventListener('click', this.handleLogout.bind(this)); 
    }

    handleLogout() {
        User.logout()
        .then(success => {
            if (success)
                alert('Logout successful');
            else
                alert(`Logout failed!`);
        });
    }
}

customElements.define("avatar-icon", Avatar);