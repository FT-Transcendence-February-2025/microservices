import avatarTemplate from './avatar.html?raw';
import User from './../../..//utils/User.js'

const template = document.createElement('template');
template.innerHTML = avatarTemplate;

export default class Avatar extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    
        const avatarButton = this.querySelector('#avatarButton');
        const userDropdown = this.querySelector('#userDropdown');
        const displayName = this.querySelector('#displayName');
        const logoutLink = this.querySelector('#logoutLink');
        const profileLink = this.querySelector('#profileLink') as HTMLAnchorElement | null;

        if (displayName)
            displayName.textContent = User.displayName;

        if (avatarButton && userDropdown)
        avatarButton.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
        if (logoutLink)
            logoutLink.addEventListener('click', this._handleLogout.bind(this));

        if (profileLink)
            profileLink.href = `/profle#${User.displayName}`;
    }

    private _handleLogout() {
        User.logout()
        .then(success => {
            if (success) {
                // @ts-ignore
                window.navigateTo('/login')
                alert('Logout successful');
            }
            else
                alert(`Logout failed!`);
        });

    }
}

customElements.define("avatar-icon", Avatar);