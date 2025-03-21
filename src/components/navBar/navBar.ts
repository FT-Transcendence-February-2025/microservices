import navbarTemplate from './navBar.html?raw';

const template = document.createElement('template');
template.innerHTML = navbarTemplate;

export default class NavBar extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("nav-bar", NavBar);