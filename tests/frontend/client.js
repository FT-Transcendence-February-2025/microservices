let clients = {}

class MatchmakingClient {
  constructor (playerId) {
    this.playerId = playerId
    this.ws = new WebSocket('ws://localhost:3000/ws')
    this.messageContainer = document.getElementById(`messages${playerId}`)
    this.acceptButton = document.getElementById(`acceptButton${playerId}`)
    this.currentMatchId = null
    this.setupWebSocket()
  }

  setupWebSocket () {
    this.ws.onopen = () => {
      this.addMessage('Connected to server', 'success')
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.addMessage('WebSocket error', 'error')
    }

    this.ws.onclose = () => {
      this.addMessage('Disconnected from server', 'error')
    }
  }

  handleMessage (message) {
    console.log(`[${this.playerId}] Received:`, {
      type: message.type,
      data: message
    })

    switch (message.type) {
    case 'queueJoined':
      this.addMessage('Joined queue successfully')
      break
    case 'matchCreated': {
      this.currentMatchId = message.matchId
      this.addMessage(`Match created! Opponent: ${message.opponentId}`)
      this.acceptButton.style.display = 'block'
      // console.log(
      //   `[${this.playerId}] Match created with ID: ${message.matchId}`
      // )
      // console.log('Set currentMatchId to:', this.currentMatchId)
      break
    }
    case 'matchStarted': {
      console.log(`[${this.playerId}] Match started`, {
        matchId: message.matchId,
        opponentId: message.opponentId
      })
      this.acceptButton.style.display = 'none'
      this.addMessage('Match started!')
      this.addMessage(`Match ID: ${message.matchId}`)
      this.addMessage(`Playing against: ${message.opponentId}`)
      // Update match status display
      const matchStatus = document.getElementById('matchMessages')
      if (matchStatus) {
        matchStatus.innerHTML = `
            <div class="message success">
              Active Match: ${message.matchId}<br>
              Players: ${this.playerId} vs ${message.opponentId}
            </div>
          `
      }
      break
    }
    case 'matchPending': {
      console.log(`[${this.playerId}] Match pending`)
      this.addMessage('Waiting for opponent to accept...')
      break
    }
    case 'matchAccepted': {
      // Add this case
      console.log(`[${this.playerId}] Match accepted confirmation`)
      this.addMessage('Match accepted, waiting for opponent...')
      break
    }
    case 'error': {
      this.addMessage(message.message, 'error')
      break
    }
    default:
      this.addMessage(JSON.stringify(message))
    }
  }

  joinQueue () {
    this.ws.send(
      JSON.stringify({
        type: 'joinQueue',
        userId: this.playerId
      })
    )
  }

  leaveQueue () {
    this.ws.send(
      JSON.stringify({
        type: 'leaveQueue',
        userId: this.playerId
      })
    )
  }

  acceptMatch () {
    console.log('Accept button clicked')
    console.log('Current match ID:', this.currentMatchId)
    console.log('WebSocket state:', this.ws.readyState)
    if (!this.currentMatchId) {
      this.addMessage('No match to accept', 'error')
      return
    }
    this.ws.send(JSON.stringify({
      type: 'matchAccept',
      userId: this.playerId,
      matchId: this.currentMatchId
    }))
  }

  addMessage (text, type = '') {
    if (!this.messageContainer) {
      console.error(`Message container for player ${this.playerId} not found`)
      return
    }
    const messageElement = document.createElement('div')
    messageElement.classList.add('message')
    if (type) {
      messageElement.classList.add(type)
    }
    messageElement.textContent = text
    this.messageContainer.appendChild(messageElement)
  }
}

// Global functions that HTML onclick can call
function joinQueue (playerId) {
  if (!clients[playerId]) {
    clients[playerId] = new MatchmakingClient(playerId)
  }
  clients[playerId].joinQueue()
}

function leaveQueue (playerId) {
  if (clients[playerId]) {
    clients[playerId].leaveQueue()
  }
}

function acceptMatch (playerId) {
  if (clients[playerId]) {
    clients[playerId].acceptMatch()
  }
}

// Initialize when page loads
window.onload = function () {
  // Pre-creating client instances is optional
  clients[1] = new MatchmakingClient(1)
  clients[2] = new MatchmakingClient(2)
}

// Initialize when page loads
window.joinQueue = joinQueue
window.leaveQueue = leaveQueue
window.acceptMatch = acceptMatch
