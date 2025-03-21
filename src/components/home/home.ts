import homeTemplate from './home.html?raw';

const template = document.createElement('template');
template.innerHTML = homeTemplate;

export default class Home extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("home-page", Home);