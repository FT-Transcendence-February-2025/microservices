import tournamentHostTemplate from './tournamentHost.html?raw';
import config from '../../../config/config'
const TOUR_URL = `${config.protocol}/${config.toBackend.tour}`
const UM_URL = `${config.protocol}/${config.toBackend.user}`

const template = document.createElement('template');
template.innerHTML = tournamentHostTemplate;

// interface TournamentResponse {
//     tournamentId: string;
//     // Add other expected response fields here
// }

interface ErrorResponse {
    message: string;
    // Add other error response fields here
}

interface Friend {
    id: number;
    username: string;
}

export default class TournamentHost extends HTMLElement {
    private selectedFriendIds: Set<number> = new Set();

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._setupEventListeners();
        this._loadFriends();
    }

    private _setupEventListeners(): void {
        const backButton = this.querySelector<HTMLAnchorElement>('a[href="/tournament"]');
        if (backButton) {
            backButton.addEventListener('click', (e) => this._handleBackClick(e));
        }
        const inviteBtn = this.querySelector<HTMLAnchorElement>('#invite-button');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._handleInvite();
            });
        }
    }

    private async _loadFriends(): Promise<void> {
        try {
            // const userId = 23; // replace with actual user ID from auth/session
            // const response = await fetch(`${UM_URL}/get-user-friend-list/${userId}`);

            // if (!response.ok) throw new Error('Failed to load friends');

            // const friends: Friend[] = await response.json();

            const friends: Friend[] = [
                { id: 1, username: 'Alice' },
                { id: 2, username: 'Bob' },
                { id: 3, username: 'Charlie' },
                { id: 4, username: 'Diana' }
            ];

            const container = this.querySelector('#friends-list');
            if (!container) return;

            friends.forEach(friend => {
                const label = document.createElement('label');
                label.className = 'flex items-center';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'custom-checkbox'; 
                checkbox.value = friend.id.toString();
                checkbox.addEventListener('change', () => {
                    const id = parseInt(checkbox.value);
                    if (checkbox.checked) {
                        this.selectedFriendIds.add(id);
                    } else {
                        this.selectedFriendIds.delete(id);
                    }
                });

                label.appendChild(checkbox);
                label.append(friend.username);
                container.appendChild(label);
            });
        } catch (err) {
            console.error('Error loading friends:', err);
        }
    }

    private async _handleInvite(): Promise<void> {
        const tournamentId = this._getTournamentIdFromUrl();
        const ids = Array.from(this.selectedFriendIds);

        if (!tournamentId) {
            alert('Missing tournament ID.');
            return;
        }

        if (ids.length === 0) {
            alert('Please select friends to invite.');
            return;
        }

        try {
            const userId = this._getUserId;
            const response = await fetch(`${TOUR_URL}/tournament/${tournamentId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    ids
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invite failed');
            }

            alert('Invites sent!');
        } catch (err) {
            console.error('Invite error:', err);
            alert(`Failed to invite: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    private async _handleBackClick(e: MouseEvent): Promise<void> {
        e.preventDefault();
    
        try {
            const tournamentId = this._getTournamentIdFromUrl();

            const response = await fetch(`${TOUR_URL}/tournament/${tournamentId}/deleteTournament`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentId })
            });
    
            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.message || 'Tournament deleted');
            }
    
            console.log(`Deleted tournament ID: ${tournamentId}.`);
    
            window.history.pushState({}, '', '/tournament');
    
            // Optional: dispatch an event if parent needs to know
            this.dispatchEvent(new CustomEvent('tournament-deleted', {
                detail: { tournamentId },
                bubbles: true
            }));
    
        } catch (error) {
            console.error('Back button action failed:', error);
            alert(`Failed to leave tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private _getTournamentIdFromUrl(): string | null {
        const pathParts = window.location.pathname.split('/');
        const tournamentId = pathParts[pathParts.length - 1];
        return tournamentId || null;
    }

    private _getUserId(): number {
        const userId = 23;
        return userId;
    }
}

customElements.define("tournament-host", TournamentHost);

//use class Friends