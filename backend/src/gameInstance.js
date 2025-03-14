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
		gameInstance.gameState = 'waiting'

		this.gameInstances.set(matchId, gameInstance)

		console.log(`Created new game instances for match ${matchId} between players ${player1Id} and ${player2Id}`)

		return { success: true }
	}

	connectedPlayersToGame(playerId, matchId, socket) {
		const gameInstance = this.gameInstances.get(matchId)
	}
}

export default GameInstanceManager