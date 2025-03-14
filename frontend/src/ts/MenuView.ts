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
            { id: "avatar", route: "/user" },
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
    
        let menuContent;
        switch (this.state) {
            case 'mainMenu':
                menuContent = this.getMainMenuHtml();
                break;
            case 'match':
                menuContent = this.getMatchHtml();
                break;
            case 'tournament':
                menuContent = this.getTournamentHtml();
                break;
            case 'local':
                menuContent = this.getLocalHtml();
                break;
            case 'remote':
                menuContent = this.getRemoteHtml();
                break;
            case 'joinMatch':
                menuContent  =this.getJoinMatchHtml();
                break;
            case 'createMatch':
                menuContent = this.getCreateMatchHtml();
                break;
            case 'joinTournament':
                menuContent = this.getJoinTournamentHtml();
                break;
            case 'createTournament':
                menuContent = this.getCreateTournamentHtml();
                break;
            default:
                menuContent = '<div>Invalid state</div>';
                break;
        }

        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <img id="avatar" class="cursor-pointer w-12 h-12 rounded-full ring-3 hover:ring-pink-700 ring-pink-600 absolute top-4 left-4" src="/images/shrek.jpg" alt="avatar">
                ${menuContent}
        </div>
        `;
    }

    getMainMenuHtml() {
        return `
        <div class="flex flex-col space-y-4">
            <button id ="matchButton" class="btn-primary">Match</button>
            <button id ="tournamentButton" class="btn-primary">Tournament</button>
        </div>
        `;
    }

    getMatchHtml() {
        return `
        <div class="flex flex-col space-y-4">
            <button id="localButton" class="btn-primary">Local</button>
            <button id="remoteButton" class="btn-primary">Remote</button>
        </div>
        `;
    }

    getTournamentHtml() {
        return `
        <div class="flex flex-col space-y-4">
            <button id="createTournamentButton" class="btn-primary">Create Tournament</button>
            <button id="joinTournamentButton" class="btn-primary">Join Tournamente</button>
        </div>
        `;
    }

    getRemoteHtml() {
        return `
        <div class="flex flex-col space-y-4">
            <button id="createMatchButton" class="btn-primary">Create Match</button>
            <button id="joinMatchButton" class="btn-primary">Join Match</button>
        </div>
        `;
    }

    getLocalHtml() {
        return `
        <h1>local match</h1>
        `;
    }

    getJoinMatchHtml() {
        return `
        <form id="joinMatchForm" class="bg-white p-6 rounded-lg" method="post">
            <label for="matchId" class="block text-sm font-bold mb-2">Match ID:</label>
            <input type="text" id="matchId" name="matchId" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 mb-4">

            <div class="flex justify-center">
                <button type="submit" class="btn-primary">Join</button>
            </div>
        </form>
        `;
    }

    getCreateMatchHtml() {
        return `
        <h1>create match</h1>
        `;
    }

    getJoinTournamentHtml() {
        return `
        <form id="joinTournamentForm" class="bg-white p-6 rounded-lg" method="post">
            <label for="matchId" class="block text-sm font-bold mb-2">Match ID:</label>
            <input type="text" id="matchId" name="matchId" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 mb-4">

            <div class="flex justify-center">
                <button type="submit" class="btn-primary">Join</button>
            </div>
        </form>
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