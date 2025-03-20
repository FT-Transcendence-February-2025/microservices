// server.js
import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

// Enable trustProxy to trust the X-Forwarded-For headers
const fastify = Fastify({ 
  logger: true,
  trustProxy: true 
});

fastify.addHook('onRequest', (request, reply, done) => {
	request.log.info({ ip: request.ip }, 'Incoming request');
	done();
});

fastify.get('/', async (request, reply) => {
	return { hello: 'world', ip: request.ip };
  });
  
  fastify.get('/health', async (request, reply) => {
	return { status: 'ok' };
  });
  
  const start = async () => {
	try {
	  await fastify.listen({ port: 3020, host: '0.0.0.0' });
	  fastify.log.info(`Server listening on ${fastify.server.address().port}`);
	} catch (err) {
	  fastify.log.error(err);
	  process.exit(1);
	}
  };
  
  start();