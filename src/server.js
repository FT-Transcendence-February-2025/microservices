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
import dotenv from 'dotenv'

const PORT = 3006

dotenv.config()

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        colorize: true
      }
    }
  }
})

await fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Matchmaking Service API',
      description: 'API documentation for the Matchmaking service',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3006', description: 'Development server' }
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

await fastify.register(fastifyCors, {
  origin: ['http://user-management:3000', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
})

// Register WebSocket
await fastify.register(fastifyWebsocket)

fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Hello Fastify. Server is running!'
  })
})

fastify.register(websocketHandler)
// fastify.register(matchmakingDbRoute)
fastify.register(matchesRoute, { prefix: '/matches' })
fastify.register(matchmakingRoute)
fastify.register(tournamentRoute, { prefix: '/tournament' })
fastify.register(tournamentResultsRoute, { prefix: '/tournament/matches' })

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
