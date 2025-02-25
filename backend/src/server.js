import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PongGame } from './game.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = 3000;
const HOST = "0.0.0.0";

const GAME_LOOP_INTERVAL = 1000/60; // 60fps

const players = new Map();

const fastify = Fastify({
    // logger: true
});

await fastify.register(websocket, {
    options: { maxPayload: 100 },
    errorHandler: function (error, socket , req , reply) {
        console.error('WebSocket error:', error);
        socket.terminate();
    }
});

await fastify.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'frontend', 'public'),
});

await fastify.register(async function (fastify) {
    fastify.get('/game', { websocket: true }, (socket, req) => {
        // Close new connections when allready 2 clients are connected
        if (players.size >= 2) {
            console.log(`Can't connect client from ${req.socket.remoteAddress} : Game is full`);
            socket.close();
            return;
        }
        // insert client connection with playerID into map
        const playerId = players.size + 1;
        players.set(socket, playerId);
        console.log(`New Client connected from ${req.socket.remoteAddress} as player[${playerId}]`);

        // Recieving message
        socket.on('message', (data) => {
            try {
                const playerId = players.get(socket);
                const message = JSON.parse(data.toString());
                if (message.type === 'paddleMove') {
                    const paddle = playerId === 1 ? PongGame.paddle1 : PongGame.paddle2;
                    if (message.dir === 'up' || message.dir === 'down' || message.dir === 'none')
                        paddle.dir = message.dir;
                }
            } catch (error) {
                console.error(`Error processing message: ${error}`);
            };
        });

        // Recieving error
        socket.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
        });

        // Client closed connection
        socket.on('close', () => {
            const playerId = players.get(socket);
            console.log(`Client closed connection from ${req.socket.remoteAddress} as player[${playerId}]`);
        });

        // Waiting for 2 clients
        if (players.size < 2)
            return;

        // Run game loop
        const gameLoop = setInterval(() => {
           PongGame.update();
           broadcastGameState(PongGame.getGameState());
        }, GAME_LOOP_INTERVAL);
    });
});

function broadcastGameState(gameState) {
    const server = fastify.websocketServer;
    const gameStateJSON = JSON.stringify(gameState);
    
    for (const client of server.clients) {
        if (client.readyState === 1)
            client.send(gameStateJSON);
    }
}

try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening at ${HOST}:${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}