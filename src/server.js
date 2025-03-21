import Fastify from 'fastify'
import dotenv from 'dotenv'
import tournamentRoutes from './routes/tournaments.js'
import { initDatabase } from './db/schema.js'
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { deletionController } from './controllers/deletionController.js'

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
  await deletionController.deleteTournaments();
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

 -request to um for users table 

 invites:
 -GET route to /tournaments/:ID once tm table was created (host.html)
 -init player table with host
 -list friends, get from um
 -invite button next to friend, when clicked, send request with current tmID
 -(maybe with via access code)
 -get tournament id from player table, where player id matches current user
 -when accepted, get userinfo with tmID in response, add to users and player table with current tmId

 -when done with invites and settings on build click, fill tm table

 -when tm is done send all important userinfo to um and delete all relatable to current user, when hosted delete instances from all tables, when invited delte only from users and players
  currently it is delteing whole tm table for workflow

 -watch video about routes, call route from controller??
*/