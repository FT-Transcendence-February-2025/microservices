import NotFoundPageTemplate from './notFound.html?raw';

const template = document.createElement('template');
template.innerHTML = NotFoundPageTemplate;

export default class NotFoundPage extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("not-found", NotFoundPage);