import AccountTemplate from './account.html?raw';
import User from '../../../utils/User';

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
    private _passwordChangeButton: HTMLButtonElement;
    private _passwordSaveButton: HTMLButtonElement;
    private _oldPasswordInput: HTMLInputElement;
    private _newPasswordInput: HTMLInputElement;

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
        this._passwordChangeButton = this.querySelector('#passwordChangeButton') as HTMLButtonElement;
        if (!this._passwordChangeButton)
            throw new Error("Could not find passwordChangeButton element");
        this._passwordSaveButton = this.querySelector('#passwordSaveButton') as HTMLButtonElement;
        if (!this._passwordSaveButton)
            throw new Error("Could not find passwordSaveButton element");
        this._oldPasswordInput = this.querySelector('#oldPasswordInput') as HTMLInputElement;
        if (!this._oldPasswordInput)
            throw new Error("Could not find oldPasswordInput element");
        this._newPasswordInput = this.querySelector('#newPasswordInput') as HTMLInputElement;
        if (!this._newPasswordInput)
            throw new Error("Could not find newPasswordInput element");
    }

    connectedCallback() {
        this._displayNameInput.value = User.displayName;
        this._emailInput.value = User.email;
        this._displayNameEditButton.addEventListener('click', this.handleDisplayNameEditButton.bind(this));
        this._emailEditButton.addEventListener('click', this.handleEmailEditButton.bind(this));
        this._displayNameSaveButton.addEventListener('click', this.handleDisplayNameSaveButton.bind(this));
        this._emailSaveButton.addEventListener('click', this.handleEmailSaveButton.bind(this));
        this._avatarUpload.addEventListener('change', this.handleAvatarUpload.bind(this));
        this._passwordChangeButton.addEventListener('click', this.handleChangePasswordButton.bind(this));
        this._passwordSaveButton.addEventListener('click', this.handlePasswordSaveButton.bind(this));
    }

    handleAvatarUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            User.changeAvatar(file)
            .then(success => {
                // this._avatar = User.avatar;
                // update avatar in html
                if (success)
                    alert('Changed Display Name successful');
                else
                    alert(`Changing Display Name failed!`);
            });
        }
    }

    handleChangePasswordButton() {
        const passwordContainer = this.querySelector('#passwordInputs');
        if (passwordContainer)
            passwordContainer.classList.remove('hidden');
        this._passwordSaveButton.classList.remove('hidden');
        this._passwordChangeButton.classList.add('hidden');
    }


    handlePasswordSaveButton() {
        let oldPassword = this._oldPasswordInput.value;
        let newPassword = this._newPasswordInput.value;
        if (oldPassword && newPassword) {
            User.changePassword(oldPassword, newPassword)
            .then(success => {
                if (success)
                    alert('Changing Password successful');
                else
                    alert(`Changing Password failed!`);
            });
        }
        this._oldPasswordInput.value = '';
        this._newPasswordInput.value = '';
        const passwordContainer = this.querySelector('#passwordInputs');
        if (passwordContainer)
            passwordContainer.classList.add('hidden');
        this._passwordSaveButton.classList.add('hidden');
        this._passwordChangeButton.classList.remove('hidden');
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

    handleEmailSaveButton() {
        const newEmail = this._emailInput.value;
        if (newEmail !== User.email) {
            User.changeDisplayName(newEmail)
            .then(success => {
                this._displayNameInput.value = User.email;
                if (success)
                    alert('Changed Display Name successful');
                else
                    alert(`Changing Display Name failed!`);
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

customElements.define("account-settings", Account);