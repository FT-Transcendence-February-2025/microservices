import playMenuTemplate from './playMenu.html?raw';

const template = document.createElement('template');
template.innerHTML = playMenuTemplate;

export default class PlayMenu extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("play-menu", PlayMenu);