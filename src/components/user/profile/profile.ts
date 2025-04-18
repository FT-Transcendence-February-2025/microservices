import ProfileTemplate from './profile.html?raw';
import User from '../../../services/UserService.js'

const template = document.createElement('template');
template.innerHTML = ProfileTemplate;

interface IMatch {
    userDisplayName: string
	opponentDisplayName: string
	userScore: number
	opponentScore: number
	matchDate: string // format (date-time)
}

interface IProfile {
	displayName: string
	avatarPath: string
	wins: number
	loses: number
    onlineStatus: boolean
    matchHistory: IMatch[]
}

export default class Profile extends HTMLElement {
    private _matchHistoryBody: HTMLTableSectionElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._matchHistoryBody = this.querySelector('#matchHistory tbody') as HTMLTableSectionElement;
        if (!this._matchHistoryBody)
            throw new Error("Could not find matchHistory Table element");        
        this._getProfile();
    }

    private _getProfile() {
        User.getProfile(window.location.hash)
        .then((profile: IProfile) => {
        
            if (profile) {
                const displayName = this.querySelector('#displayName');
                if (displayName)
                    displayName.textContent = profile.displayName;
            
                if (profile.onlineStatus)
                    this.querySelector('#online')?.removeAttribute('hidden');
                else
                    this.querySelector('#offline')?.removeAttribute('hidden');

                const image = this.querySelector('#avatar') as HTMLImageElement;
                if (image)
                    image.src = profile.avatarPath;

                const wins = this.querySelector('#wins');
                if (wins)
                    wins.textContent = `${profile.wins}`;

                const losses = this.querySelector('#losses');
                if (losses)
                    losses.textContent = `${profile.loses}`;

                profile.matchHistory.forEach((match) => {
                    this._addMatchToTable(match)
                });
            }
        });
    }


    private _addMatchToTable(match: IMatch) {
        const rowColor = match.userScore > match.opponentScore ? 'bg-green-200' : 'bg-red-200';
        const date = new Date(match.matchDate);
        const localeFormattedDate = date.toLocaleDateString();

        // Truncate opponent name if longer than 9 characters
        const maxLength = 9;
        let title = '';
        let opponentDisplayName = match.opponentDisplayName;
        if (opponentDisplayName.length > maxLength) {
            opponentDisplayName = opponentDisplayName.slice(0, maxLength - 1) + '.';
            title = `title="${match.opponentDisplayName}"`;
        }
        this._matchHistoryBody.innerHTML += `
        <tr class="${rowColor} transition-colors duration-200">
        <td class="px-4 py-2 border border-gray-300">${match.userScore}/${match.opponentScore}</td>
            <td class="px-4 py-2 border border-gray-300" ${title}">${opponentDisplayName}</td>
            <td class="px-4 py-2 border border-gray-300">${localeFormattedDate}</td>
        </tr>
        `;
    }
}

customElements.define("profile-card", Profile);