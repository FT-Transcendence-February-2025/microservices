import AccountTemplate from './account.html?raw';
import User from '../../../services/UserService';

const template = document.createElement('template');
template.innerHTML = AccountTemplate;

export default class Account extends HTMLElement {
    private _displayNameEditButton: HTMLButtonElement;
    private _displayNameSaveButton: HTMLButtonElement;
    private _displayNameInput: HTMLInputElement;
    private _emailEditButton: HTMLButtonElement;
    private _emailSaveButton: HTMLButtonElement;
    private _emailInput: HTMLInputElement;
    private _avatarUpload: HTMLInputElement;
    private _avatar: HTMLImageElement;

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
        this._avatar = this.querySelector('#avatar') as HTMLImageElement;
        if (!this._avatar)
            throw new Error("Could not find avatar element");
    }

    connectedCallback() {
        this._displayNameInput.value = User.displayName;
        this._emailInput.value = User.email;
        this._avatarUpload.src = User.avatarPath;
        this._displayNameEditButton.addEventListener('click', this._handleDisplayNameEditButton.bind(this));
        this._emailEditButton.addEventListener('click', this._handleEmailEditButton.bind(this));
        this._displayNameSaveButton.addEventListener('click', this._handleDisplayNameSaveButton.bind(this));
        this._emailSaveButton.addEventListener('click', this._handleEmailSaveButton.bind(this));
        this._avatarUpload.addEventListener('change', this._handleAvatarUpload.bind(this));
    }

    private _handleAvatarUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            User.changeAvatar(file)
            .then(success => {
                this._avatar.src = User.avatarPath;
                if (success)
                    alert('Changed Avatar successful');
                else
                    alert(`Changing Avatar failed!`);
            });
        }
    }

    private _handleDisplayNameEditButton() {
        this._displayNameInput.readOnly = false;
        this._displayNameEditButton.classList.add('hidden');
        this._displayNameSaveButton.classList.remove('hidden');
    }

    private _handleDisplayNameSaveButton() {
        const newDisplayName = this._displayNameInput.value;
        if (newDisplayName !== User.displayName) {
            User.changeDisplayName(newDisplayName)
            .then(success => {
                this._displayNameInput.value = User.displayName;
                if (success)
                    alert('Changed Display Name successful');
                else
                    alert(`Changing Display Name failed!`);
            });
        }
        this._displayNameInput.readOnly = true;
        this._displayNameEditButton.classList.remove('hidden');
        this._displayNameSaveButton.classList.add('hidden');
    }

    private _handleEmailEditButton() {
        this._emailInput.readOnly = false;
        this._emailEditButton.classList.add('hidden');
        this._emailSaveButton.classList.remove('hidden');
    }

    private _handleEmailSaveButton() {
        const newEmail = this._emailInput.value;
        if (newEmail !== User.email) {
            User.changeDisplayName(newEmail)
            .then(success => {
                this._displayNameInput.value = User.email;
                if (success)
                    alert('Changed Email successful');
                else
                    alert(`Changing Email failed!`);
            });
        }
        this._emailInput.readOnly = false;
        this._emailEditButton.classList.remove('hidden');
        this._emailSaveButton.classList.add('hidden');
    }
}

customElements.define("account-settings", Account);