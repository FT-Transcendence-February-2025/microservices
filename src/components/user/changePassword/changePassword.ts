import changePasswordTempalte from './changePassword.html?raw';
import User from '../../../services/UserService.js'

const template = document.createElement('template');
template.innerHTML = changePasswordTempalte;

export default class ChangePassword extends HTMLElement {
    private _passwordChangeButton: HTMLButtonElement;
    private _oldPasswordInput: HTMLInputElement;
    private _newPasswordInput: HTMLInputElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._passwordChangeButton = this.querySelector('#passwordChangeButton') as HTMLButtonElement;
        if (!this._passwordChangeButton)
            throw new Error("Could not find passwordChangeButton element");
        this._oldPasswordInput = this.querySelector('#oldPasswordInput') as HTMLInputElement;
        if (!this._oldPasswordInput)
            throw new Error("Could not find oldPasswordInput element");
        this._newPasswordInput = this.querySelector('#newPasswordInput') as HTMLInputElement;
        if (!this._newPasswordInput)
            throw new Error("Could not find newPasswordInput element");
    }

    connectedCallback() {
        this._passwordChangeButton.addEventListener('click', this._handlePasswordChangeButton.bind(this));
    }

    private _handlePasswordChangeButton() {
        const oldPassword = this._oldPasswordInput.value;
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
    }
}

customElements.define("change-password", ChangePassword);