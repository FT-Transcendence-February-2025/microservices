import ProfileTemplate from './profile.html?raw';

const template = document.createElement('template');
template.innerHTML = ProfileTemplate;

export default class Profile extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("profile-card", Profile);