export function webSocketConnection(callbacks?: {
	onOpen?: (event: Event) => void,
	onMessage?: (event: MessageEvent) => void,
	onError?: (event: Event) => void,
	onClose?: (event: CloseEvent) => void}): 
	WebSocket {
	console.log("Initializing WebSocket connection to matchmaking service");

	const wsUrl = `ws://localhost:3006/ws`;
	const ws = new WebSocket(wsUrl);

	// Backend uses the preHandler(and attaches the trusted userId) so your joinQueue action doesn’t need to supply the userId explicitly.
	ws.onopen = (event) => {
		console.log('Connected to matchmaking WebSocket');
		if (callbacks?.onOpen) {
			callbacks.onOpen(event);
		}
	};

	ws.onmessage = (event) => {
		if (callbacks?.onMessage) {
			callbacks.onMessage(event);
		} else {
			console.log("Received message: ", event.data);
		}
	};
	
	ws.onerror = (event) => {
		if (callbacks?.onError) {
			callbacks.onError(event);
		} else {
			console.error("WebSocket error:", event);
		}
	};
	
	ws.onclose = (event) => {
		if (callbacks?.onClose) {
			callbacks.onClose(event);
		} else {
			console.log("WebSocket closed:", event);
		}
	};

	return ws;
}



