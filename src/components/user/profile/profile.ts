import ProfileTemplate from './profile.html?raw';
import User from '../../../utils/User';

const template = document.createElement('template');
template.innerHTML = ProfileTemplate;

export default class Profile extends HTMLElement {
    private _displayNameEditButton: HTMLButtonElement;
    private _displayNameSaveButton: HTMLButtonElement;
    private _displayNameInput: HTMLInputElement;
    private _emailEditButton: HTMLButtonElement;
    private _emailSaveButton: HTMLButtonElement;
    private _emailInput: HTMLInputElement;
    private _avatarUpload: HTMLInputElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._displayNameEditButton = this.querySelector('#displayNameEditButton') as HTMLButtonElement;
        if (!this._displayNameEditButton)
            throw new Error("Could not find displayNameEditButton element");
        this._displayNameSaveButton = this.querySelector('#displayNameSaveButton') as HTMLButtonElement;
        if (!this._displayNameSaveButton)
            throw new Error("Could not find displayNameSaveButton element");
        this._displayNameInput = this.querySelector('#displayNameInput') as HTMLInputElement;
        if (!this._displayNameInput)
            throw new Error("Could not find displayNameInput element");
        this._emailEditButton = this.querySelector('#emailEditButton') as HTMLButtonElement;
        if (!this._emailEditButton)
            throw new Error("Could not find emailEditButton element");
        this._emailSaveButton = this.querySelector('#emailSaveButton') as HTMLButtonElement;
        if (!this._emailSaveButton)
            throw new Error("Could not find emailSaveButton element");
        this._emailInput = this.querySelector('#emailInput') as HTMLInputElement;
        if (!this._emailInput)
            throw new Error("Could not find emailInput element");
        this._avatarUpload = this.querySelector('#avatarUpload') as HTMLInputElement;
        if (!this._avatarUpload)
            throw new Error("Could not find avatarUpload element");
    }

    connectedCallback() {
        this._displayNameInput.value = User.displayName;
        this._emailInput.value = User.email;
        this._displayNameEditButton.addEventListener('click', this.handleDisplayNameEditButton.bind(this));
        this._emailEditButton.addEventListener('click', this.handleEmailEditButton.bind(this));
        this._displayNameSaveButton.addEventListener('click', this.handleDisplayNameSaveButton.bind(this));
        this._emailSaveButton.addEventListener('click', this.handleEmailSaveButton.bind(this));
        this._avatarUpload.addEventListener('change', this.handleAvatarUpload.bind(this));
    }

    handleAvatarUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            User.changeAvatar(file)
            .then(response => {
                if (response.success)
                    alert('Avatar uploaded successfully!');
                else 
                    alert(`Changing Avatar failed: ${response.errorMessage}`);
            });
        }
    }

    handleDisplayNameEditButton() {
        this._displayNameInput.readOnly = false;
        this._displayNameEditButton.classList.add('hidden');
        this._displayNameSaveButton.classList.remove('hidden');
    }

    handleDisplayNameSaveButton() {
        const newDisplayName = this._displayNameInput.value;
        if (newDisplayName !== User.displayName) {
            User.changeDisplayName(newDisplayName)
            .then(response => {
                if (response.success)
                    alert('Changed Display Name successful');
                else
                    alert(`Changing Display Name failed: ${response.errorMessage}`);
            });
        }
        this._displayNameInput.readOnly = true;
        this._displayNameEditButton.classList.remove('hidden');
        this._displayNameSaveButton.classList.add('hidden');
    }

    handleEmailSaveButton() {
        const newEmail = this._emailInput.value;
        if (newEmail !== User.email) {
            User.changeDisplayName(newEmail)
            .then(response => {
                if (response.success)
                    alert('Changed Display Name successful');
                else
                    alert(`Changing Display Name failed: ${response.errorMessage}`);
            });
        }
        this._emailInput.readOnly = false;
        this._emailEditButton.classList.remove('hidden');
        this._emailSaveButton.classList.add('hidden');
    }

    handleEmailEditButton() {
        this._emailInput.readOnly = false;
        this._emailEditButton.classList.add('hidden');
        this._emailSaveButton.classList.remove('hidden');
    }
}

customElements.define("profile-card", Profile);