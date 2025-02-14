import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PongGame } from './game.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = 3000;
const HOST = '0.0.0.0';

const GAME_LOOP_INTERVAL = 1000/60; // 60fps

// Instantiate the framework
const fastify = Fastify({
    // logger: true
});

// Register plugins
await fastify.register(websocket);
await fastify.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'frontend', 'public'),
    prefix: '/'
});

// HTTP route
fastify.get('/', async function handler (req, reply) {
    return reply.sendFile('index.html');
});

const players = new Map();

// WS route
fastify.get('/game', { websocket: true }, (connection, req) => {
    // Close new connection when allready 2 clients are connected
    if (players.size >= 2) {
        try {
            console.log('Can not connect new client: Game is full');
            connection.socket.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
            connection.socket.close();
        } catch (error) {
            console.error('Failed to send WebSocket message:', error);
        }
        return;
    }

    // Insert client connection with playerId into players map
    const playerId = players.size + 1;
    players.set(connection, playerId);
    console.log(`New Client connected from ${req.socket.remoteAddress} as player[${playerId}]`);

    // Recieving message
    connection.socket.on('message', (data) => {
        try {
            const playerId = players.get(connection);
            const message = JSON.parse(data.toString());
            if (message.type === 'paddleMove') {
                if (playerId === 1) PongGame.paddle1.dir = message.dir;
                else if (playerId === 2) PongGame.paddle2.dir = message.dir;
            }
        } catch (error) {
            console.error(`Error processing message: ${error}`);
        };
    });

    // Recieving error
    connection.socket.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    // Client closed connection
    connection.socket.on('close', () => {
        const playerId = players.get(connection);
        players.delete(connection);
        console.log(`Client closed connection from ${req.socket.remoteAddress} as player[${playerId}]`);
    });

    // Waiting for 2 clients
    if (players.size < 2)
        return;

    // Start game loop
    const gameLoop = setInterval(() => {
       PongGame.update();
       broadcastGameState(PongGame.getGameState());
    }, GAME_LOOP_INTERVAL);
});

function broadcastGameState(gameState) {
    const server = fastify.websocketServer;
    const gameStateJSON = JSON.stringify(gameState);
    
    for (const client of server.clients) {
      if (client.readyState === 1) {
        client.send(gameStateJSON);
      }
    }
}

// Run the server !
try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening at ${HOST}:${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
};