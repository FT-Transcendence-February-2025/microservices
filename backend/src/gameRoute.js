import gameInstanceManager from './gameInstance.js'

export default async function gameRoute(fastify, options) {
    fastify.post('/games', async (request, reply) => {
        const { matchId, player1Id, player2Id } = request.body

        if (!matchId || !player1Id || !player2Id) {
            return reply.code(400).send({
                statusCode: 400,
                success: false,
                message: 'Missing required parameters'
            })
        };
        const result = gameInstanceManager.createGameInstance(matchId, player1Id, player2Id);
        return result;
    })

    fastify.get('/games/:matchId', { websocket: true }, (socket, req) => {
        const matchId = req.params.matchId;
        const playerId = parseInt(req.query.playerId);

        if (!matchId || !playerId) {
            console.log('Invalid connection attempt: Missing matchId or playerId');
            socket.close(1008, 'Invalid connection parameters');
            return
        }

        // Register the player's connection
        const registration = gameInstanceManager.connectedPlayersToGame(playerId, matchId, socket);
        if (!registration.success) {
            socket.close(1008, registration.message)
            return
        }

        console.log(`Player ${playerId} connected to game ${matchId}`);

        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString())

                if (message && message.type === 'paddleMove' &&
                    ['up', 'down', 'none'].includes(message.dir)) {
                        gameInstanceManager.handlePlayerInput(playerId, message);
                    }
            } catch (error) {
                console.error(`Error processing message: ${error}`);
            }
        });

        socket.on('close', () => {
            console.log(`Player ${playerId} disconnected from game ${matchId}`);
            gameInstanceManager.disconnectPlayer(playerId);
        });

        socket.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
            gameInstanceManager.disconnectPlayer(playerId);
        });
    });

    // Debug route
    fastify.get('/debug/games', async (request, reply) => {
        reply.send(Array.from(gameInstanceManager.gameInstances.values()).map(instance => ({
            matchId: instance.matchId,
            player1Id: instance.player1Id,
            player2Id: instance.player2Id,
            connectedPlayers: Array.from(instance.connectedPlayers),
            gameState: instance.gameState
        })));
    });
}
