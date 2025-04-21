import { collectDefaultMetrics, Histogram, Registry } from 'prom-client';

// Create a new Prometheus registry
const register = new Registry();

// Collect default system metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Define a custom histogram to track HTTP request durations
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Function to expose the /metrics endpoint with silent logging
export const metricsRoute = (fastify) => {
  fastify.get('/metrics', {
    logLevel: 'silent', // This completely suppresses logs for this route
    handler: async (_request, reply) => {
      try {
        const metrics = await register.metrics();
        reply.type('text/plain').send(metrics);
      } catch (error) {
        reply.status(500).send('Error collecting metrics');
      }
    }
  });
};

export const addMetricsHook = (fastify) => {
  fastify.addHook('onRequest', (request, _reply, done) => {
    if (request.url === '/metrics') {
      // Skip processing for /metrics requests
      return done();
    }
    // Record the start time of the request
    request.startTime = process.hrtime();
    done();
  });
  
  fastify.addHook('onResponse', (request, reply, done) => {
    if (request.url === '/metrics') {
      // Skip metrics tracking for /metrics requests
      return done();
    }
    
    const route = request.routerPath || 'unknown_route';
    const method = request.method;
    const statusCode = reply.statusCode;
  
    // Calculate the duration of the request
    const [seconds, nanoseconds] = process.hrtime(request.startTime);
    const duration = seconds + nanoseconds / 1e9; // Convert to seconds
  
    // Record the duration in the histogram
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
  
    done();
  });
};

export default register;