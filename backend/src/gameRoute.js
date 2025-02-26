import PongGame from './gameLogic.js';

const GAME_LOOP_INTERVAL = 1000/60; // 60fps

const players = new Map();

export default async function gameRoute(fastify, options) {
    fastify.get('/game', { websocket: true }, (socket, req) => {
        if (players.size >= 2) {
            console.log(`Can't connect client from ${req.socket.remoteAddress} : Game is full`);
            socket.close();
            return;
        } else {
            const playerId = players.size + 1;
            players.set(socket, playerId);
            console.log(`New Client connected from ${req.socket.remoteAddress} as player[${playerId}]`);
        }

        socket.on('message', (data) => { 
            try {
                const playerId = players.get(socket);
                const message = JSON.parse(data.toString());

                if (isValidMessage(message)) {
                    const paddle = playerId === 1 ? PongGame.paddle1 : PongGame.paddle2;
                    const directionMap = {
                        'up': -1,
                        'down': 1,
                        'none': 0
                    };
                    paddle.dir = directionMap[message.dir];
                }
            } catch (error) {
                console.error(`Error processing message: ${error}`);
            }
        });

        socket.on('close', () => {
            const playerId = players.get(socket);
            console.log(`Client closed connection from ${req.socket.remoteAddress} as player[${playerId}]`);
        });

        socket.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
        });

        if (players.size < 2)
            return;

        const gameLoop = setInterval(() => {
           PongGame.update(gameLoop);
           broadcastGameState(PongGame.getGameState(), fastify);
        }, GAME_LOOP_INTERVAL);
    });
}

function isValidMessage(message) {
    return (
        message &&
        typeof message === 'object' &&
        message.type === 'paddleMove' &&
        ['up', 'down', 'none'].includes(message.dir)
    );
}

function broadcastGameState(gameState, fastify) {
    const server = fastify.websocketServer;
    const gameStateJSON = JSON.stringify(gameState);
    
    for (const client of server.clients) {
        if (client.readyState === 1)
            client.send(gameStateJSON);
    }
}