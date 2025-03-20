import Fastify from 'fastify'
import dotenv from 'dotenv'
import tournamentRoutes from './routes/tournaments.js'
import { initDatabase } from './db/schema.js'
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { tournamentController } from './controllers/tournamentControllers.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', // Serve files at the root URL
});

const PORT = process.env.PORT || 3000

// Initialize database
try {
  initDatabase()
  console.log('Database initialized successfully')
} catch (error) {
  console.error('Failed to initialize database:', error)
  process.exit(1)
}

// Routes
fastify.register(tournamentRoutes, { prefix: '/tournaments' })

fastify.get('/', (_request, reply) => {
  reply.sendFile('tournament.html');
})

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Tournament service listening at port ${PORT}`)
    return fastify // Return the server instance
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

fastify.addHook('onClose', async () => {
  await tournamentController.deleteTournaments();
})

start()

process.on('SIGINT', async () => {
  try {
    await fastify.close()
    console.log('Server closed successfully')
    process.exit(0)
  } catch (err) {
    console.error('Error closing server:', err)
    process.exit(1)
  }
})


/*
 - make tournament id accessible for routes
 - send out invite from from tournament id 
*/