class MatchmakingClient {
  constructor(playerId) {
    this.playerId = playerId;
    this.ws = new WebSocket('ws://localhost:3000/ws');
    this.messageContainer = document.getElementById(`messages${playerId}`);
    this.acceptButton = document.getElementById(`acceptButton${playerId}`);
    this.currentMatchId = null;
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.ws.onopen = () => {
      this.addMessage('Connected to server', 'success');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.addMessage('WebSocket error', 'error');
    };

    this.ws.onclose = () => {
      this.addMessage('Disconnected from server', 'error');
    };
  }

  handleMessage(message) {
    console.log(`[${this.playerId}] Received:`, {
      type: message.type,
      data: message,
    });

    switch (message.type) {
      case 'queueJoined':
        this.addMessage('Joined queue successfully');
        break;
      case 'matchCreated': {
        this.addMessage(`Match created! Opponent: ${message.opponentId}`);
        console.log(
          `[${this.playerId}] Match created with ID: ${message.matchId}`
        );
        this.currentMatchId = message.matchId;
        console.log('Set currentMatchId to:', this.currentMatchId);
        this.acceptButton.style.display = 'inline';
        break;
      }
      case 'matchStarted': {
        console.log(`[${this.playerId}] Match started`, {
          matchId: message.matchId,
          opponentId: message.opponentId,
        });
        this.acceptButton.style.display = 'none';
        this.addMessage('Match started!');
        this.addMessage(`Match ID: ${message.matchId}`);
        this.addMessage(`Playing against: ${message.opponentId}`);
        // Update match status display
        const matchStatus = document.getElementById('matchMessages');
        if (matchStatus) {
          matchStatus.innerHTML = `
            <div class="message success">
              Active Match: ${message.matchId}<br>
              Players: ${this.playerId} vs ${message.opponentId}
            </div>
          `;
        }
        break;
      }
      case 'matchPending': {
        console.log(`[${this.playerId}] Match pending`);
        this.addMessage('Waiting for opponent to accept...');
        break;
      }
      case 'matchAccepted': {
        // Add this case
        console.log(`[${this.playerId}] Match accepted confirmation`);
        this.addMessage('Match accepted, waiting for opponent...');
        break;
      }
      case 'error': {
        this.addMessage(message.message, 'error');
        break;
      }
      default:
        this.addMessage(JSON.stringify(message));
    }
  }

  joinQueue() {
    this.ws.send(
      JSON.stringify({
        type: 'joinQueue',
        userId: this.playerId,
      })
    );
  }

  leaveQueue() {
    this.ws.send(
      JSON.stringify({
        type: 'leaveQueue',
        userId: this.playerId,
      })
    );
  }

  acceptMatch() {
    console.log('Accept button clicked');
    console.log('Current match ID:', this.currentMatchId);
    console.log('WebSocket state:', this.ws.readyState);
    if (!this.currentMatchId) {
      this.addMessage('No match to accept', 'error');
      return;
    }
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error(
        `[${this.playerId}] WebSocket not ready: ${this.ws.readyState}`
      );
      this.addMessage('WebSocket not connected', 'error');
      return;
    }

    const acceptMessage = {
      type: 'matchAccept',
      userId: this.playerId,
      matchId: this.currentMatchId,
    };

    console.log(`[${this.playerId}] Sending match accept:`, acceptMessage);

    try {
      this.ws.send(JSON.stringify(acceptMessage));
      this.addMessage(`Sent match acceptance for match ${this.currentMatchId}`);
      this.acceptButton.style.display = 'none';
    } catch (error) {
      console.error(`[${this.playerId}] Error sending match accept:`, error);
      this.addMessage('Failed to accept match', 'error');
    }
  }

  addMessage(text, type = '') {
    const div = document.createElement('div');
    div.textContent = text;
    div.className = `message ${type}`;
    this.messageContainer.appendChild(div);
  }
}

// Global clients
let client1, client2;

function initializeClients() {
    client1 = new MatchmakingClient(1);
    client2 = new MatchmakingClient(2);
}

function joinQueue(playerId) {
    const client = playerId === 1 ? client1 : client2;
    client.joinQueue();
}

function leaveQueue(playerId) {
    const client = playerId === 1 ? client1 : client2;
    client.leaveQueue();
}

function acceptMatch(playerId) {
  console.log('acceptMatch called with playerId:', playerId);
  const client = playerId === 1 ? client1 : client2;
  client.acceptMatch();
}

// Initialize when page loads
window.onload = initializeClients;
window.joinQueue = joinQueue;
window.leaveQueue = leaveQueue;
window.initializeClients = initializeClients;
window.acceptMatch = acceptMatch;