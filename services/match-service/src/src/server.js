import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
<<<<<<< HEAD
import { userRoutes } from './routes/users.js'
=======
>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a
import { matchmakingDbRoute } from './routes/database_route.js'
import { websocketHandler } from './websocket/index.js'
import { initDatabase } from './db/schema.js'
import matchesRoute from './routes/match_routes.js'
import matchmakingRoute from './routes/matchmaking-route.js'
<<<<<<< HEAD

const PORT = 3003
=======
import tournamentRoute from './routes/tournament_route.js'

const PORT = 3000
>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a

const fastify = Fastify({
  logger: true
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
<<<<<<< HEAD
  origin: ['http://user:3000', 'http://localhost:3000'],
=======
  origin: ['http://user-management:3000', 'http://localhost:3000'],
>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
})

// Register WebSocket
await fastify.register(fastifyWebsocket)

<<<<<<< HEAD
// Test get route to send reply message
=======
>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a
fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Hello Fastify. Server is running!'
  })
})

<<<<<<< HEAD
// Routes
fastify.register(userRoutes)
=======
>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a
fastify.register(websocketHandler)
fastify.register(matchmakingDbRoute)
fastify.register(matchesRoute, { prefix: '/matches' })
fastify.register(matchmakingRoute)
<<<<<<< HEAD

// Server
=======
fastify.register(tournamentRoute, { prefix: '/tournament' })

>>>>>>> 23374cfc189bf63826a3422aa8f875beed69671a
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
