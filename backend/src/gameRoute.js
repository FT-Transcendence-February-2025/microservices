import gameInstanceManager from './gameInstance.js'

export default async function gameRoute(fastify, options) {
    fastify.post('/api/game', async (request, reply) => {
        const { matchId, player1Id, player2Id } = request.body

        if (!matchId || !player1Id || !player2Id) {
            return reply.code(400).send({
                statusCode: 400,
                success: false,
                message: 'Missing required parameters'
            })
        };
        const result = gameInstanceManager.createGameInstance(matchId);
        return result;
    })

    fastify.get('/game/:matchId', { websocket: true }, (socket, req) => {
        const matchId = req.params.matchId;
        const playerId = parseInt(req.query.playerId);

        if (!matchId || !playerId) {
            console.log('Invalid connection attempt: Missing matchId or playerId');
            socket.socket.close(1008, 'Invalid connection parameters');
            return
        }

        console.log(`Player ${playerId} connected to game ${matchId}`);

        socket.socket.on('message', (data) => {
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

        socket.socket.on('close', () => {
            console.log(`Player ${playerId} disconnected from game ${matchId}`);
            gameInstanceManager.disconnectPlayer(playerId);
        });

        socket.socket.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
            gameInstanceManager.disconnectPlayer(playerId);
        });
    });
}
