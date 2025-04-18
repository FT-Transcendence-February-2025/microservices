import ProfileTemplate from './profile.html?raw';
import User from '../../../utils/UserManager.js'

const template = document.createElement('template');
template.innerHTML = ProfileTemplate;

interface IProfile {
	displayName: string
	avatarPath: string
	wins: number
	loses: number
    onlineStatus: boolean
}

export default class Profile extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._getProfile();
    }

    private _getProfile() {
        User.getFriendProfile(window.location.hash)
        .then((profile: IProfile) => {
            if (profile) {
                const displayName = this.querySelector('#displayName');
                if (displayName)
                    displayName.textContent = profile.displayName;
            
                if (profile.onlineStatus)
                    this.querySelector('#online')?.classList.remove('hidden');
                else
                    this.querySelector('#offline')?.classList.remove('hidden');

                const image = this.querySelector('#avatar') as HTMLImageElement;
                if (image)
                    image.src = profile.avatarPath;

                const wins = this.querySelector('#wins');
                if (wins)
                    wins.textContent = `${profile.wins}`;

                const losses = this.querySelector('#losses');
                if (losses)
                    losses.textContent = `${profile.loses}`;

            }
        });
    }
}

customElements.define("profile-card", Profile);