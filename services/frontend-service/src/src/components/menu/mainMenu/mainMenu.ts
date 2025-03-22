import mainMenuTemplate from './mainMenu.html?raw';

const template = document.createElement('template');
template.innerHTML = mainMenuTemplate;

export default class MainMenu extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("main-menu", MainMenu);