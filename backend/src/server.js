import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = 3000;
const HOST = "0.0.0.0";

const fastify = Fastify({
    // logger: true
});

await fastify.register(fastifyStatic, {
    root: join(__dirname, 'frontend', 'public'),
});

fastify.setNotFoundHandler((request, reply) => {
    reply.sendFile('index.html');
});

try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening at ${HOST}:${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}