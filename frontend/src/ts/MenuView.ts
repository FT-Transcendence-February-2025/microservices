import AbstractView from "./AbstractView.js";
import type Router from "./Router.js"

type ButtonConfig = {
    id: string
    route: string
}

export default class MenuView extends AbstractView {
    private state: 'mainMenu' | 'match' | 'tournament' | 'local' | 'remote' | 'joinMatch' | 'createMatch' | 'joinTournament' | 'createTournament';
    private buttonConfigs: ButtonConfig[];
    constructor(router: Router) {
        super(router);
        this.state = 'mainMenu';
        this.buttonConfigs = [
            { id: "matchButton", route: "/menu/match" },
            { id: "tournamentButton", route: "/menu/tournament" },
            { id: "localButton", route: "/menu/match/local" },
            { id: "remoteButton", route: "/menu/match/remote" },
            { id: "joinMatchButton", route: "/menu/match/remote/join" },
            { id: "createMatchButton", route: "/menu/match/remote/create" },
            { id: "joinTournamentButton", route: "/menu/tournament/join" },
            { id: "createTournamentButton", route: "/menu/tournament/create" },
        ];
    }

    private setState() {
        switch (location.pathname) {
            case '/menu':
                return 'mainMenu';
            case '/menu/match':
                return 'match';
            case '/menu/match/remote':
                return 'remote';
            case '/menu/match/local':
                return 'local';
            case '/menu/match/remote/join':
                return 'joinMatch';
            case '/menu/match/remote/create':
                return 'createMatch';
            case '/menu/tournament':
                return 'tournament';
            case '/menu/tournament/join':
                return 'joinTournament';
            case '/menu/tournament/create':
                return 'createTournament';
            default:
                return 'mainMenu';
        }
    }

    async getHtml() {
        this.state = this.setState();
    
        switch (this.state) {
            case 'mainMenu':
                return this.getMainMenuHtml();
            case 'match':
                return this.getMatchHtml();
            case 'tournament':
                return this.getTournamentHtml();
            case 'local':
                return this.getLocalHtml();
            case 'remote':
                return this.getRemoteHtml();
            case 'joinMatch':
                return this.getJoinMatchHtml();
            case 'createMatch':
                return this.getCreateMatchHtml();
            case 'joinTournament':
                return this.getJoinTournamentHtml();
            case 'createTournament':
                return this.getCreateTournamentHtml();
            default:
                return '<div>Invalid state</div>';
        }
    }

    getMainMenuHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="matchButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Match</button>
                    <button id="tournamentButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Tournament</button>
                </div>
            </div>
        </div>
        `;
    }

    getMatchHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="localButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Local</button>
                    <button id="remoteButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Remote</button>
                </div>
            </div>
        </div>
        `;
    }

    getTournamentHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="createTournamentButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Create Tournament</button>
                    <button id="joinTournamentButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Join Tournamente</button>
                </div>
            </div>
        </div>
        `;
    }

    getLocalHtml() {
        return `
        <h1>local match</h1>
        `;
    }

    getRemoteHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button id="createMatchButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Create Match</button>
                    <button id="joinMatchButton" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Join Match</button>
                </div>
            </div>
        </div>
        `;
    }

    getJoinMatchHtml() {
        return `
        <h1>join match</h1>
        `;
    }

    getCreateMatchHtml() {
        return `
        <h1>create match</h1>
        `;
    }

    getJoinTournamentHtml() {
        return `
        <h1>join tournament</h1>
        `;
    }

    getCreateTournamentHtml() {
        return `
        <h1>create tournament</h1>
        `;
    }

    init () {
        this.buttonConfigs.forEach((config) => {
            const button: HTMLElement | null = document.getElementById(config.id);
            if (button) {
                button.addEventListener("click", () => {
                    this.router.navigateTo(config.route);
                });
            }
        });
    }
}