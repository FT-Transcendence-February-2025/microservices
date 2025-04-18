import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyWebsocket from '@fastify/websocket'
// import { matchmakingDbRoute } from './routes/database_route.js'
import { websocketHandler } from './websocket/index.js'
import { initDatabase } from './db/schema.js'
import matchesRoute from './routes/match_routes.js'
import matchmakingRoute from './routes/matchmaking-route.js'
import tournamentRoute from './routes/tournament_route.js'
import tournamentResultsRoute from './routes/tournament_results_route.js'
//////////////DOCKER CONTAINER start
import config from './config/config.js';
import { metricsRoute, addMetricsHook } from './config/metrics.js';
import { addLoggingHooks } from './config/logging.js';

const PORT = 3003
// Create your Fastify instance with the logger configuration from config.
const fastify = Fastify({
  logger: config.logger,
});


// Add the logging hooks
addLoggingHooks(fastify);
// Add the metrics hook to track all requests
addMetricsHook(fastify);
// Expose the /metrics endpoint
metricsRoute(fastify);
////////////////////////////////////////////////////DOCKER CONTAINER end

await fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Matchmaking Service API',
      description: 'API documentation for the Matchmaking service',
      version: '1.0.0'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Development server' }
    ]
  }
})

await fastify.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
})

// Initialize database
try {
  initDatabase()
  console.log('Database initialized successfully')
} catch (error) {
  console.error('Failed to initialize database:', error)
  process.exit(1)
}

fastify.register(fastifyCors, {
  origin: [
    `https://${process.env.DOMAIN}`,
    `http://match.${process.env.DOMAIN}`,
    `http://${process.env.IP}:${PORT}`,
    config.endpoints.match
  ],
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
})

// Register WebSocket
await fastify.register(fastifyWebsocket)

fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Hello Fastify. Match Server is running!'
  })
})

fastify.register(websocketHandler)
// fastify.register(matchmakingDbRoute)
fastify.register(matchesRoute, { prefix: `${config.apiPrefix}/matches` })
fastify.register(matchmakingRoute)
fastify.register(tournamentRoute, { prefix: `${config.apiPrefix}/tournament` })
fastify.register(tournamentResultsRoute, { prefix: `${config.apiPrefix}/tournament/matches` })

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Matchmaking service listening at port: ${PORT} `)
    console.log()
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()
