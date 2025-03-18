import PongGame from './gameLogic.js'

const GAME_LOOP_INTERVAL = 1000/60

class GameInstanceManager {
	constructor () {
		this.gameInstances = new Map()
		this.playerConnections = new Map()
	}

	createGameInstance(matchId, player1Id, player2Id) {
		if (this.gameInstances.has(matchId)) {
			return {
				success: false,
				message: 'Game instance already exists'
			}
		}

		const gameInstance = new PongGame()

		gameInstance.player1Id = player1Id
		gameInstance.player2Id = player2Id
		gameInstance.matchId = matchId

		gameInstance.connectedPlayers = new Set()
		gameInstance.gameState = 'pending'

		this.gameInstances.set(matchId, gameInstance)

		console.log(`Created new game instances for match ${matchId} between players ${player1Id} and ${player2Id}`)

		return { success: true }
	}

	connectedPlayersToGame(playerId, matchId, socket) {
		const gameInstance = this.gameInstances.get(matchId)
		if (!gameInstance) {
			return {
				success: false,
				message: 'Game instance not found'
			}
		}
	
		if (gameInstance.player1Id != playerId && gameInstance.player2Id != playerId) {
			return {
				success: false,
				message: 'Player not part of this match'
			};
		}
	
		this.playerConnections.set(playerId, { socket, matchId })
		gameInstance.connectedPlayers.add(playerId);
	
		console.log(`Player ${playerId} connected to match ${matchId} | Connected count: ${gameInstance.connectedPlayers.size}`)
	
		if (gameInstance.connectedPlayers.size === 2 && gameInstance.gameState === 'in_progress') {
			this.startGame(matchId)
		}
		return { success: true }
	}

	startGame(matchId) {
		const gameInstance = this.gameInstances.get(matchId)

		if (!gameInstance) {
			return {
				success: false,
				message: 'Game instance not found'
			};
		}
		gameInstance.gameState = 'in_progress'
		console.log(`Starting game for match ${matchId}`)

		// Game starts here
		const gameLoop = setInterval(() => {
			gameInstance.update(gameLoop)
			this.broadcastGameState(matchId, gameInstance.getGameState())

			// clean up if game is over
			if (gameInstance.isGameOver) {
				clearInterval(gameLoop)
				gameInstance.gameState = 'completed'
				this.endGame(matchId)
			}
		}, GAME_LOOP_INTERVAL)

		gameInstance.gameLoop = gameLoop
		return { success: true }
	}

	endGame(matchId) {
		const gameInstance = this.gameInstances.get(matchId)

		if (!gameInstance) {
			return
		}
		console.log(`Game ended for match ${matchId}`)

		for (const playerId of gameInstance.connectedPlayers) {
			this.playerConnections.delete(playerId)
		}

		// set delay before removing game instance
		setTimeout(() => {
			this.gameInstances.delete(matchId)
		}, 5000)
	}

	handlePlayerInput(playerId, action) {
		const playerConnection = this.playerConnections.get(playerId)

		if (!playerConnection) {
			return {
				success: false,
				message: 'Player not connected to any game'
			};
		}
		const matchId = playerConnection.matchId;
		const gameInstance = this.gameInstances.get(matchId)

		if (!gameInstance) {
			return {
				success: false,
				message: 'Game instance not found'
			}
		}
		const paddle = playerId == gameInstance.player1Id ? gameInstance.paddleLeft : gameInstance.paddleRight

		const directionMap = {
			'up': -1,
			'down': 1,
			'none': 0
		}
		paddle.dir = directionMap[action.dir]
		return { success: true }
	}

	broadcastGameState(matchId, gameState) {
		const gameInstance = this.gameInstances.get(matchId)

		if (!gameInstance) {
			return
		}

		const stateJSON = JSON.stringify(gameState)

		for (const playerId of gameInstance.connectedPlayers) {
			const playerConnection = this.playerConnections.get(playerId)
			if (playerConnection && playerConnection.socket.readyState === 1) {
				playerConnection.socket.send(stateJSON)
			}
		}
	}

	disconnectPlayer(playerId) {
		const playerConnection = this.playerConnections.get(playerId)

		if (!playerConnection) {
			return
		}

		const matchId = playerConnection.matchId
		const gameInstance = this.gameInstances.get(matchId)

		if (gameInstance) {
			gameInstance.connectedPlayers.delete(playerId)

			if (gameInstance.gameState === 'playing') {
				clearInterval(gameInstance.gameLoop)
				gameInstance.gameState = 'ended'
				this.endGame(matchId)
			}
		}
		this.playerConnections.delete(playerId)
	}
}

export default new GameInstanceManager()