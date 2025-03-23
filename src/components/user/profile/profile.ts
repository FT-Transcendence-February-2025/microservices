import ProfileTemplate from './profile.html?raw';

const template = document.createElement('template');
template.innerHTML = ProfileTemplate;

export default class Profile extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const displayNameEditButton = this.querySelector('#displayNameEditButton');
        if (displayNameEditButton)
            displayNameEditButton.addEventListener('click', this.handleDisplayNameEditButton.bind(this));

        const emailEditButton = this.querySelector('#emailEditButton');
        if (emailEditButton)
            emailEditButton.addEventListener('click', this.handleEmailEditButton.bind(this));
    }

    handleDisplayNameEditButton() {
        const displayNameInput = this.querySelector('#displayNameInput');
        if (displayNameInput && displayNameInput instanceof HTMLInputElement)
            displayNameInput.readOnly = false;

        const displayNameEditButton = this.querySelector('#displayNameEditButton')
        if (displayNameEditButton)
            displayNameEditButton.classList.add('hidden');
    
        const displayNameSaveButton = this.querySelector('#displayNameSaveButton')
        if (displayNameSaveButton)
            displayNameSaveButton.classList.remove('hidden');
    }

    handleEmailEditButton() {
        const emailInput = this.querySelector('#emailInput');
        if (emailInput && emailInput instanceof HTMLInputElement)
            emailInput.readOnly = false;

        const emailEditButton = this.querySelector('#emailEditButton')
        if (emailEditButton)
            emailEditButton.classList.add('hidden');

        const saveButton = this.querySelector('#emailSaveButton')
        if (saveButton)
            saveButton.classList.remove('hidden');
    }
}

customElements.define("profile-card", Profile);