import queueTemplate from './queue.html?raw';
import { router } from '../../../index';
import { webSocketConnection } from '../../../services/webSocketHandler';

const template = document.createElement('template');
template.innerHTML = queueTemplate;

export default class Queue extends HTMLElement {
    private _card: HTMLElement;
    private _joinBtn!: HTMLElement;
    private _ws: WebSocket | null = null;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._card = this.querySelector('.card') as HTMLElement;
        if (!this._card) {
            throw new Error("Could not find '.card' element")
        }
    }

    connectedCallback(): void {
        this._card.innerHTML = `
            <div class="text-lg font-bold mb-6">Online Game:</div>
            <button id="joinBtn" class="btn-primary w-full mb-4">Join Queue</button>
            <a href="/play" class="btn-primary w-full">Back</a>
        `;
        this._joinBtn = this._card.querySelector('#joinBtn') as HTMLButtonElement;
        if (!this._joinBtn) throw new Error("Count not find joinBtn element")
        
        this._joinBtn.addEventListener('click', this.handleJoinBtnClick.bind(this));
    }

    private handleJoinBtnClick(): void {
       this._card.innerHTML = `
            <div class="text-lg font-bold mb-6">You are in the queue!</div>
            <div class="text-sm animate-pulse mb-12">Waiting for an opponent...</div>
            <a href="/play" class="btn-primary w-full" id="leaveLink">Leave Queue</a>
        `;
        this._ws = webSocketConnection({
            onOpen: (event) => {
                console.log("WebSocket onOpen callback fired:", event);
                this._ws?.send(JSON.stringify({
                    type: 'joinQueue'
                }));
            },
            onMessage: (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket callback received:", data);
                switch (data.type) {
                    case 'joinQueue':
                        console.log("Successfully joined the queue");
                        break;
                    case 'matchCreated':
                        this.updateUIForMatchCreated(data);
                        break;
                    case 'matchAccepted':
                        console.log("Match accepted:", data.message);
                        break;
                    case 'matchStarted':
                        console.log("Match started. Redirecting to game URL:", data.gameUrl);
                        window.location.href = data.gameUrl;
                        break;
                    case 'leaveQueue':
                        console.log("Left the queue");
                        break;
                    default:
                        console.warn("Received unknown message type:", data.type);
                        break;
                }
            }
        });

        // Attach a listener to the leave link to send the WS message
        const leaveLink = this._card.querySelector('#leaveLink') as HTMLAnchorElement;
        leaveLink.addEventListener('click', (event: Event) => {
            event.preventDefault();
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                this._ws.send(JSON.stringify({ type: 'leaveQueue' }));
            } else {
                console.error("WebSocket connection is not available");
            }
            router.navigateTo('/play');
        })
    }

    private updateUIForMatchCreated(data: { matchId: string, gameUrl?: string }): void {
        this._card.innerHTML = `
        <div class="text-lg font-bold mb-6">Match Ready!</div>
        <div class="text-sm mb-12">
            Match ID: ${data.matchId}
        </div>
        <button id="startMatchBtn" class="btn-primary w-full mb-4">Start Match</button>
        <a href="/play" class="btn-primary w-full" id="cancelMatchLink">Cancel Match</a>
        `;
        const cancelMatchLink = this._card.querySelector('#cancelMatchLink') as HTMLAnchorElement;
        cancelMatchLink.addEventListener('click', (event: Event) => {
            event.preventDefault();
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                this._ws.send(JSON.stringify({ type: 'leaveQueue' }));
            } else {
                console.error("WebSocket connection is not available");
            }
            // Let router navigate back
            // router.navigateTo('/play');
        });

        const startMatchBtn = this._card.querySelector('#startMatchBtn') as HTMLButtonElement;
        startMatchBtn.addEventListener('click', () => {
            if (data.gameUrl) {
                window.location.href = data.gameUrl;
            }
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                this._ws.send(JSON.stringify({
                    type: 'matchAccept',
                    matchId: data.matchId
                }));
                console.log('Sent matchAccept message');
            } else {
                console.error("WebSocket connection is not available");
            }
        });
    }
}

customElements.define("online-queue", Queue);