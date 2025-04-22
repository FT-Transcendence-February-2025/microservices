import tournamentMenuTemplate from './tournamentMenu.html?raw';
import config from '../../../config/config'
const TOUR_URL = `${config.protocol}/${config.toBackend.tour}/:3004`

const template = document.createElement('template');
template.innerHTML = tournamentMenuTemplate;

interface TournamentResponse {
    tournamentId: string;
    // Add other expected response fields here
}

interface ErrorResponse {
    message: string;
    // Add other error response fields here
}

export default class TournamentMenu extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._setupEventListeners();
    }

    private _setupEventListeners(): void {
        const hostButton = this.querySelector<HTMLAnchorElement>('a[href="/tournament/host"]');
        if (hostButton) {
            hostButton.addEventListener('click', (e) => this._handleHostClick(e));
        }

        const backButton = this.querySelector<HTMLAnchorElement>('a[href="/home"]');
        if (backButton) {
            backButton.addEventListener('click', (e) => this._handleBackClick(e));
        }
    }

    private async _handleHostClick(e: MouseEvent): Promise<void> {
        e.preventDefault();
        
        try {
            // const userId = 23; // In a real app, get this from auth state
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${TOUR_URL}/tournament/host`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                },
                
            });

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.message || 'Failed to create tournament');
            }

            const tournamentData: TournamentResponse = await response.json();
            console.log('Full tournament response:', tournamentData);

            // Update URL with new tournament ID
            window.history.pushState({}, '', `/tournament/${tournamentData.tournamentId}`);
            console.log('Tournament ID:', tournamentData.tournamentId);
            
            // Dispatch event to parent component
            this.dispatchEvent(new CustomEvent('tournament-created', {
                detail: { tournamentId: tournamentData.tournamentId },
                bubbles: true
            }));
            
        } catch (error) {
            console.error('Tournament creation failed:', error);
            // Show error to user
            alert(`Failed to create tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async _handleBackClick(e: MouseEvent): Promise<void> {
        e.preventDefault();
    
        try {
            const userId = 23; // Get this from auth or session state in a real app
    
            const response = await fetch(`${TOUR_URL}/tournament/deleteUser`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
    
            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.message || 'Failed to delete user from tournament');
            }
    
            console.log('User removed from tournament.');
    
            // Navigate to /home manually
            window.history.pushState({}, '', '/home');
    
            // Optional: dispatch an event if parent needs to know
            this.dispatchEvent(new CustomEvent('user-left-tournament', {
                detail: { userId },
                bubbles: true
            }));
    
        } catch (error) {
            console.error('Back button action failed:', error);
            alert(`Failed to leave tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

    }
}

customElements.define("tournament-menu", TournamentMenu);



// export async function postApiFormData(url: string, body: any) {
//     const accessToken = localStorage.getItem('accessToken');
//     const response = await fetchWithToken(url, {
//         method: 'POST',
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//         },
//         body: body
//     });
//     return response;
// }
