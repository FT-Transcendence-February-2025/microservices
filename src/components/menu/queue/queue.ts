import queueTemplate from './queue.html?raw';

const template = document.createElement('template');
template.innerHTML = queueTemplate;

export default class Queue extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("online-queue", Queue);