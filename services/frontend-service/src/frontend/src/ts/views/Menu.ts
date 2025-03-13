import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    private state: 'menu' | 'play' | 'tournament';

    constructor(initialState: 'menu' | 'play' | 'tournament' = 'menu') {
        super();
        this.state = initialState;
    }

    async getHtml() {
        switch (this.state) {
            case 'menu':
                return this.getMenuHtml();
            case 'play':
                return this.getPlayHtml();
            case 'tournament':
                return this.getTournamentHtml();
            default:
                return '<div>Invalid state</div>';
        }
    }

    private getMenuHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="play-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Play</button>
                    <button id="tournament-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Tournament</button>
                </div>
            </div>
        </div>
        `;
    }

    private getPlayHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="local-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Local</button>
                    <button onClick="navigateTo('/game')" id="remote-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Online</button>
                    <button id="back-to-menu-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Back</button>
                </div>
            </div>
        </div>
        `;
    }

    private getTournamentHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="create-tournament-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Create</button>
                    <button id="join-tournament-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Join</button>
                    <button id="back-to-menu-button" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Back</button>
                </div>
            </div>
        </div>
        `;
    }

    setState(newState: 'menu' | 'play' | 'tournament') {
        this.state = newState;
    }

    async afterRender() {
        // Add event listeners for buttons
        if (this.state === 'menu') {
            document.getElementById('play-button')?.addEventListener('click', () => {
                this.setState('play');
                this.updateView();
            });

            document.getElementById('tournament-button')?.addEventListener('click', () => {
                this.setState('tournament');
                this.updateView();
            });
        } else if (this.state === 'play') {
            document.getElementById('back-to-menu-button')?.addEventListener('click', () => {
                this.setState('menu');
                this.updateView();
            });
        } else if (this.state === 'tournament') {
            document.getElementById('back-to-menu-button')?.addEventListener('click', () => {
                this.setState('menu');
                this.updateView();
            });
        }
    }

    private async updateView() {
        // Re-render the view with the updated state
        const appElement = document.getElementById("app") as HTMLElement;
        appElement.innerHTML = await this.getHtml();

        // Re-bind event listeners after re-rendering
        await this.afterRender();
    }
}