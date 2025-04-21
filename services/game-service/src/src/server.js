import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import gameRoute from './gameRoute.js';
////////////////////////////////////////////////////DOCKER CONTAINER start
import config from './config/config.js';
import { metricsRoute, addMetricsHook } from './config/metrics.js';
import { addLoggingHooks } from './config/logging.js';

// Create your Fastify instance with the logger configuration from config.
const fastify = Fastify({
  logger: config.logger,
});

// Add the logging hooks
// addLoggingHooks(fastify);
// Add the metrics hook to track all requests
addMetricsHook(fastify);
// Expose the /metrics endpoint
metricsRoute(fastify);

////////////////////////////////////////////////////DOCKER CONTAINER end
const PORT = 3005;
const __dirname = dirname(fileURLToPath(import.meta.url));

const HOST = "0.0.0.0";

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