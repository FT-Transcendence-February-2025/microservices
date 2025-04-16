import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import gameRoute from './gameRoute.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = 3005;
const HOST = "0.0.0.0";

const fastify = Fastify({
    // logger: true
});

await fastify.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'frontend', 'public'),
});

await fastify.register(websocket, {
    options: { maxPayload: 100 },
    errorHandler: function (error, socket , req , reply) {
        console.error('WebSocket error:', error);
        socket.terminate();
    }
});

await fastify.register(gameRoute);

try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening at ${HOST}:${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}