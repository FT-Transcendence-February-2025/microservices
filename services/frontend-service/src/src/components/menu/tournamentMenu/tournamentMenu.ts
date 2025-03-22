import tournamentMenuTemplate from './tournamentMenu.html?raw';

const template = document.createElement('template');
template.innerHTML = tournamentMenuTemplate;

export default class TournamentMenu extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("tournament-menu", TournamentMenu);