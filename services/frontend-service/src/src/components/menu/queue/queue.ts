import queueTemplate from './queue.html?raw';
import MatchmakingSocket from './utils/matchmakingSocket';

const template = document.createElement('template');
template.innerHTML = queueTemplate;

export default class Queue extends HTMLElement {
    private _card: HTMLElement;
    private _ws: WebSocket | null = null;
    private _countDownDuration: number = 15;
    private _countdownInterval: number | null = null;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._card = this.querySelector('.card') as HTMLElement;
        if (!this._card) {
            throw new Error("Could not find '.card' element")
        }
    }

    connectedCallback(): void {
        this._ws = MatchmakingSocket.getInstance();
        this._ws.onopen = (event) => {
            console.log("Queue Global socket onOpen", event);
            const token = localStorage.getItem('accessToken');
            this._ws?.send(JSON.stringify({ type: 'joinQueue', token }));
            this._startCountdown(this._countDownDuration);
        };
        this._ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WebSocket callback received:", data);
            switch (data.type) {
                case 'joinQueue':
                    console.log("Successfully joined the queue");
                    break;
                case 'matchCreated':
                    this._renderMatchCreated(data);
                    break;
                case 'matchAccepted':
                    console.log("Match accepted:", data.message);
                    break;
                case 'matchStarted':
                    const matchId = data.matchId;
                    const playerId = data.playerId;
                    const gameUrl = `/game?matchId=${matchId}&playerId=${playerId}`;
                    console.log("Match started. Redirecting to game URL:", gameUrl);
                    // @ts-ignore
                    window.navigateTo(gameUrl);
                    break;
                case 'leaveQueue':
                    console.log("Left the queue");
                    this._ws?.close();
                    break;
                case 'matchCancelled':
                    console.log("Match Cancelled")
                    this.displayNotification('Your match has been cancelled. Please try again later.');
                    setTimeout(() => {
                        this._ws?.close();
                        // @ts-ignore
                        window.navigateTo('/play');
                    }, 2000);
                    break;
                default:
                    console.warn("Received unknown message type:", data.type);
                    break;
            }
        }

        // Attach a listener to the leave link to send the WS message
        const leaveLink = this._card.querySelector('#leaveLink') as HTMLAnchorElement;
        leaveLink.addEventListener('click', (event: Event) => {
            event.preventDefault();
            if (this._countdownInterval) {
                cancelAnimationFrame(this._countdownInterval);
                this._countdownInterval = null;
            }
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                this._ws.send(JSON.stringify({ type: 'leaveQueue' }));
            } else {
                console.error("WebSocket connection is not available");
            }
            // @ts-ignore
            window.navigateTo('/play');
        });
    };

    private _startCountdown(duration: number): void {
        const countdownEl = this._card.querySelector('#countdown') as HTMLElement;
        if (!countdownEl) return;
        if (this._countdownInterval) {
            cancelAnimationFrame(this._countdownInterval);
            this._countdownInterval = null;
        }
        this._card.style.border = "4px solid transparent";

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;


        const update = () => {
            const now = Date.now();
            // Calculate progress fraction (0 to 1)
            const progressFraction = Math.min((now - startTime) / (duration * 1000), 1);
            const progressAngle = progressFraction * 360;

            this._card.style.borderImage = `conic-gradient(
            from 0deg,
            #ec4899 0deg,
            #ec4899 ${progressAngle}deg,
            transparent ${progressAngle}deg,
            transparent 360deg) 1`;

            // Optionally clear the countdown text
            countdownEl.textContent = '';

            if (now < endTime) {
                this._countdownInterval = requestAnimationFrame(update);
            } else {
                // Countdown finished, execute final actions.
                if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                    this._ws.send(JSON.stringify({ type: 'leaveQueue' }));
                }
                // @ts-ignore
                window.navigateTo('/play');
            }
        };

        update();
    }


    private _renderMatchCreated(data: { matchId: string, oppDisplayName?: string }): void {
        if (this._countdownInterval) {
            cancelAnimationFrame(this._countdownInterval);
            this._countdownInterval = null;
        }

        this._card.innerHTML = `
            <div class="fixed inset-0 flex items-center justify-center">
                <div class="card text-center max-w-lg w-full bg-white p-8 m-4 rounded-lg shadow-lg">
                    <div class="flex flex-col space-y-8">
                        <h1 class="text-2xl font-bold text-black">Match Ready!</h1>
                        <div class="text-md text-gray-800">
                            Match ID: ${data.matchId}<br>
                            Opponent: ${data.oppDisplayName}
                        </div>
                        <button id="startMatchBtn" class="btn-primary w-3/4 mx-auto mb-4">Start Match</button>
                        <a href="/play" class="btn-primary w-3/4 mx-auto" id="cancelMatchLink">Cancel Match</a>
                    </div>
                </div>
            </div>
        `;

        const cancelMatchLink = this._card.querySelector('#cancelMatchLink') as HTMLAnchorElement;
        cancelMatchLink.addEventListener('click', (event: Event) => {
            event.preventDefault();
            if (this._ws && this._ws.readyState === WebSocket.OPEN) {
                this._ws.send(JSON.stringify({
                    type: 'matchCancelled',
                    matchId: data.matchId
                }));
            } else {
                console.error("WebSocket connection is not available");
            }
        });

        const startMatchBtn = this._card.querySelector('#startMatchBtn') as HTMLButtonElement;
        startMatchBtn.addEventListener('click', () => {
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

    private displayNotification(message: string): void {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        const container = document.getElementById('notifications');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        setTimeout(() => notification.remove(), 2000);
    }
}

customElements.define("online-queue", Queue);