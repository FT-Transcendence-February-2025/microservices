import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import { userRoutes } from './routes/users.js'
import { matchmakingDbRoute } from './routes/database_route.js'
import { websocketHandler } from './websocket/index.js'
import { initDatabase } from './db/schema.js'

const PORT = 3000

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
  origin: ['http://authentication:3000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})

// Register WebSocket
await fastify.register(fastifyWebsocket)

// Test get route to send reply message
fastify.get('/', (request, reply) => {
  reply.send({
    message: 'Hello Fastify. Server is running!'
  })
})

// Routes
fastify.register(userRoutes)
fastify.register(websocketHandler)
fastify.register(matchmakingDbRoute)

// Server
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
