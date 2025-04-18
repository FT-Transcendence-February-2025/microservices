import PongGame from './gameLogic.js'
import config from './config/config.js';

const GAME_LOOP_INTERVAL = 1000/60

class GameInstanceManager {
	constructor () {
		this.gameInstances = new Map()
		this.playerConnections = new Map()
	}

	async createGameInstance(matchId, player1Id, player2Id, isLocal = true, tournamentId = null) {
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
		gameInstance.isLocal = isLocal

		if (tournamentId) {
			gameInstance.tournamentId = tournamentId
		}

		this.gameInstances.set(matchId, gameInstance)

		console.log(`Created new game instances for match ${matchId} between players ${player1Id} and ${player2Id}${tournamentId ? ` in tournament ${tournamentId}` : ''}`)

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
	
		if (!gameInstance.isLocal && gameInstance.player1Id != playerId && gameInstance.player2Id != playerId) {
			return {
				success: false,
				message: 'Player not part of this match'
			};
		}
	
		this.playerConnections.set(playerId, { socket, matchId })
		gameInstance.connectedPlayers.add(playerId);
	
		console.log(`Player ${playerId} connected to match ${matchId} | Connected count: ${gameInstance.connectedPlayers.size}`)
	
		if (gameInstance.isLocal && gameInstance.connectedPlayers.size === 1 && gameInstance.gameState === 'pending') {
			setTimeout(() => {
				this.startGame(matchId)
			}, 1000)
		} else if (!gameInstance.isLocal && gameInstance.connectedPlayers.size === 2 && gameInstance.gameState === 'pending') {
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

			if (!gameInstance) return
			console.log(`Game ended for match ${matchId}`)

			if (gameInstance.gameState === 'completed') {
				let winnerId, winnerScore, loserScore
				if (gameInstance.paddleLeft.score > gameInstance.paddleRight.score) {
					winnerId = gameInstance.player1Id
					winnerScore = gameInstance.paddleLeft.score
					loserScore = gameInstance.paddleRight.score
				} else if (gameInstance.paddleRight.score > gameInstance.paddleLeft.score) {
					winnerId = gameInstance.player2Id
					winnerScore = gameInstance.paddleRight.score
					loserScore = gameInstance.paddleLeft.score
				}
				if (!gameInstance.isLocal) {
					if (gameInstance.tournamentId) {
						this.saveTournamentMatchResults(
							matchId,
							gameInstance.tournamentId,
							gameInstance.player1Id,
							gameInstance.player2Id,
							gameInstance.paddleLeft.score,
							gameInstance.paddleRight.score
						)
					} else {
						this.saveMatchResults(
							matchId,
							gameInstance.player1Id,
							gameInstance.player2Id,
							gameInstance.paddleLeft.score,
							gameInstance.paddleRight.score
						)
					}
				}
				const finishMessage = JSON.stringify({
					type: 'matchFinished',
					matchId,
					winnerId,
					winnerScore,
					loserScore
				})

				for (const playerId of gameInstance.connectedPlayers) {
					const playerConnection = this.playerConnections.get(playerId)
					console.log(`Sending finishMessage: ${finishMessage} to ${playerConnection}`)
					if (playerConnection && playerConnection.socket.readyState === 1)
						playerConnection.socket.send(finishMessage)
				}

			for (const playerId of gameInstance.connectedPlayers) {
				this.playerConnections.delete(playerId)
			}

			// set delay before removing game instance
			setTimeout(() => {
				this.gameInstances.delete(matchId)
			}, 5000)
		}
	}

	async saveTournamentMatchResults(matchId, tournamentId, player1Id, player2Id, player1Score, player2Score) {
		try {
			const winnerId = player1Score > player2Score ? player1Id :
				(player2Score > player1Score ? player2Id : null);
			
			const response = await fetch(`${config.endpoints.tour}/tournament/matches/results`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					matchId,
					tournamentId,
					player1Score,
					player2Score,
					winnerId
				})
			})
			const result = await response.json();
			console.log(`Tournament match results saved for match ${matchId}: ${result.success ? 'success' : 'failed'}`);
		} catch (error) {
			console.error(`Error saving tournament match results ${error.message}`)
		}
	}

	async saveMatchResults(matchId, player1Id, player2Id, player1Score, player2Score) {
		try {
			const winnerId = player1Score > player2Score ? player1Id :
							(player2Score > player1Score ? player2Id : null);

			const response = await fetch(`${config.endpoints.tour}/matches/results`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					matchId,
					player1Score,
					player2Score,
					winnerId
				})
		});

			const result = await response.json();
			console.log(`Match results saved for match ${matchId}: ${result.success ? 'success' : 'failed'}`);
		} catch (error) {
			console.error(`Error saving match results ${error.message}`)
		}
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
		
		const directionMap = {
			'up': -1,
			'down': 1,
			'none': 0
		}
		if (gameInstance.isLocal && action.side) {
			const paddle = action.side === 'left' ?  gameInstance.paddleLeft : gameInstance.paddleRight
			paddle.dir = directionMap[action.dir]
		} else {
			const paddle = playerId == gameInstance.player1Id ? gameInstance.paddleLeft : gameInstance.paddleRight
			paddle.dir = directionMap[action.dir]
		}
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

			if (gameInstance.gameState === 'in_progress') {
				clearInterval(gameInstance.gameLoop)

				let winnerId
				if (playerId === gameInstance.player1Id) {
					winnerId = gameInstance.player2Id
					gameInstance.paddleLeft.score = 0
					gameInstance.paddleRight.score = gameInstance.paddleRight.score || 1
				} else {
					winnerId = gameInstance.player1Id
					gameInstance.paddleRight.score = 0
					gameInstance.paddleLeft.score = gameInstance.paddleRight.score || 1
				}
				console.log(`Player ${playerId} disconnected. Declaring player ${winnerId} the winner for match ${matchId}. `)
				gameInstance.gameState = 'completed'
				this.endGame(matchId)
			}
		}
		this.playerConnections.delete(playerId)
	}
}

export default new GameInstanceManager()