export default class NotificationService {
    private _notificationContainer: HTMLElement;
    private _notificationWebsocket: WebSocket;

    constructor() {
        this._notificationContainer = document.getElementById('notifications') as HTMLElement;
        if (!this._notificationContainer)
            throw new Error("Could not find notification container");
        this._notificationWebsocket = new WebSocket('');

        // this.instance = new WebSocket(`wss://${window.location.hostname}:${PORT}/ws`);

        this._notificationWebsocket.onopen = () => {
            // send authentication token
            console.log("Connected notification websocket to server");
        };
        this._notificationWebsocket.onclose = () => {
            console.log("WebSocket connection closed.");
        };
        this._notificationWebsocket.onerror = (error) => {
            console.error("Notification websocket error:", error);
        };
        this._notificationWebsocket.onmessage = (message) => {
            this._handelMessage(message);
        }

        // this._socket.onmessage = (message) => {
        //     try {
        //         const parsedData = JSON.parse(message.data);
        //         if (parsedData.type == 'matchFinished') {
        //             console.log('Received finishMessage:', parsedData);
        //             this.updateUIForMatchFinished({
        //                 winnerId: parsedData.winnerId,
        //                 winnerScore: parsedData.winnerScore,
        //                 loserScore: parsedData.loserScore
        //             });
        //         } else {
        //             this._updateGameState(parsedData);
        //         }
        //             this._updateGameState(parsedData);
        //     } catch (error) {
        //         console.error('Failed to parse received data:', error);
        //     }
    }

    private _handelMessage(message: MessageEvent<any>) {
        // type: "notification_friend_request",
        // invitingUser: {
        //     id: invitingUser.id,
        //     displayName: invitingUser.display_name
        // }

        // type: "notification_game_invite",
		// invitingUser: {
		// 	id: invitingUser.id,
		// 	displayName: invitingUser.display_name
		// }

        // type: "notification_tournament_invite",
		// tournament: {
		// 	id: tournamentId,
		// 	name: tournamentName
		// }

        // type: "notification_verify_email"
    }

    private _gameInviteNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = '';
    }

    private _tournamentInviteNotification() {

    }

    private emailVerifyNotification() {

    }

    private _friendRequestNotification() {

    }

    private _renderNotification(notification: HTMLElement) {
        if (!this._notificationContainer) {
            console.error("Notifications container not found!")
            return;
        }
        this._notificationContainer.appendChild(notification);
    }
}