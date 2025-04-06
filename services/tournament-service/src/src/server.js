import Fastify from 'fastify'
import cors from '@fastify/cors'
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

fastify.register(cors, {
  origin: true, // or specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

// fastify.addHook('onRequest', (request, reply, done) => {
//   console.log('Raw URL:', request.raw.url);
//   console.log('Parsed URL:', request.url);
//   done();
// });

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', // Serve files at the root URL
});

const PORT = process.env.PORT || 3003

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

// fastify.addHook('onClose', async () => {
//   await deletionController.deleteTournaments();
// })

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

/*TODO:

  -handle tournament time
  -handle deleting info via status
  -join: friends list  and random on main tm frontend
      - accept player that wants to join

 -when done with invites and settings on build click, fill tm table

 -when tm is done send all important userinfo to um and delete all relatable to current user, when hosted delete instances from all tables, when invited delte only from users and players
  currently it is delteing whole tm table for workflow
*/

/*
after push from 42 computer, in order to run on laptop:

 # Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 22
# Verify the Node.js version:
node -v # Should print "v22.14.0".
nvm current # Should print "v22.14.0".
# Verify npm version:
npm -v # Should print "10.9.2".

npm init
*/