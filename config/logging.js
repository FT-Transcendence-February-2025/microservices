export const addLoggingHooks = (fastify) => {
	fastify.addHook('onRequest', (request, _reply, done) => {
	  if (request.url === '/metrics') {
		// Skip logging for /metrics
		return done();
	  }
	  // Record the start time of the request
	  request.startTime = process.hrtime();
	  fastify.log.info({ method: request.method, url: request.url }, 'Incoming request');
	  done();
	});
  
	fastify.addHook('onResponse', (request, reply, done) => {
	  if (request.url === '/metrics') {
		// Skip logging for /metrics
		return done();
	  }
	  const route = request.routerPath || 'unknown_route';
	  const method = request.method;
	  const statusCode = reply.statusCode;
  
	  // Calculate the duration of the request
	  const [seconds, nanoseconds] = process.hrtime(request.startTime);
	  const duration = seconds * 1e3 + nanoseconds / 1e6; // Convert to milliseconds
  
	  // Log the response
	  fastify.log.info(
		{
		  method,
		  route,
		  statusCode,
		  responseTime: `${duration.toFixed(3)}ms`,
		},
		'Request completed'
	  );
	  done();
	});
  
	fastify.setErrorHandler((error, request, reply) => {
	  if (request.url === '/metrics') {
		// Skip logging for /metrics
		return reply.status(500).send({ error: 'Internal Server Error' });
	  }
	  fastify.log.error(
		{
		  method: request.method,
		  url: request.url,
		  error: error.message,
		  stack: error.stack,
		},
		'Request errored'
	  );
	  reply.status(500).send({ error: 'Internal Server Error' });
	});
  };