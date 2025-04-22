import mainMenuTemplate from './mainMenu.html?raw';
import config from '../../../config/config'
const TOUR_URL = `${config.protocol}/${config.toBackend.tour}`
const template = document.createElement('template');

template.innerHTML = mainMenuTemplate;
interface TournamentResponse {
    message: string;
}

interface ErrorResponse {
    message: string;
}

export default class MainMenu extends HTMLElement {
constructor() {
    super();
    this.appendChild(template.content.cloneNode(true));
    this._setupEventListeners();
}

private _setupEventListeners(): void {
    const hostButton = this.querySelector<HTMLAnchorElement>('a[href="/tournament"]');
    if (hostButton) {
        hostButton.addEventListener('click', (e) => this._handleHostClick(e));
    }
}

private async _handleHostClick(e: MouseEvent): Promise<void> {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('accessToken');
        console.log(token)
        const response = await fetch(`${TOUR_URL}/tournament/addUser`, {
            method: 'POST',
            headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorData: ErrorResponse = await response.json();
            throw new Error(errorData.message || 'Failed to add user to tournament');
        }

        const responseData: TournamentResponse = await response.json();
        console.log('Tournament response:', responseData.message);

        this.dispatchEvent(new CustomEvent('tournament-created', {
            bubbles: true
        }));
        
    } catch (error) {
        console.error('Tournament creation failed:', error);
        alert(`Failed to create tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
}

customElements.define("main-menu", MainMenu);