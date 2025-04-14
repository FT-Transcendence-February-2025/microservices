class MatchmakingSocket {
	private static instance: WebSocket | null = null;

	public static getInstance(): WebSocket {
		if (!this.instance || this.instance.readyState > WebSocket.OPEN) {
			this.instance = new WebSocket(`ws://${window.location.hostname}:3006/ws`);

			this.instance.onopen = (event: Event) => {
				console.log("Global matchmaking socket connected", event);
			};
			this.instance.onerror = (error) => {
				console.error("Global matchmaking socket error", error);
			};
			this.instance.onclose = (event) => {
				console.log("Global matchmaking socket closed", event);
			};
		}
		return this.instance;
	}
}

export default MatchmakingSocket;