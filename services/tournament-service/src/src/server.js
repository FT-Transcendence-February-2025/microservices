import Fastify from 'fastify'
// import cors from '@fastify/cors'
// import tournamentRoutes from './routes/tournament-routes.js'
// import { initDatabase } from './db/schema.js'
// import path from 'path';
// import { fileURLToPath } from 'url';
import { metricsRoute, addMetricsHook } from './config/metrics.js';
import { addLoggingHooks } from './config/logging.js';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// import Fastify from 'fastify'
import cors from '@fastify/cors'
import tournamentRoutes from './routes/tournament-routes.js'
import { initDatabase } from './db/schema.js'
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3004

// Create your Fastify instance with the logger configuration from config.
const fastify = Fastify({
  logger: config.logger,
});

addMetricsHook(fastify);
// // Expose the /metrics endpoint
metricsRoute(fastify);
fastify.register(cors, {
	origin: [
        `https://${process.env.DOMAIN}`,
        `http://tour.${process.env.DOMAIN}`,
		`http://${process.env.IP}:${PORT}`,
		config.endpoints.tour,
		'*'
    ],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'], 
	credentials: true
})
// fastify.addHook('onRequest', (request, reply, done) => {
//   console.log('Raw URL:', request.raw.url);
//   console.log('Parsed URL:', request.url);
//   done();
// });

// fastify.register(fastifyStatic, {
//   root: path.join(__dirname, 'public'),
//   prefix: '/', // Serve files at the root URL
// });

// Initialize database
try {
  initDatabase()
  console.log('Database initialized successfully')
} catch (error) {
  console.error('Failed to initialize database:', error)
  process.exit(1)
}

// Routes
fastify.register(tournamentRoutes, { prefix:  `${config.apiPrefix}/tournament`})

// fastify.get('/', (_request, reply) => {
//   reply.sendFile('tournament.html');
// })

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`Tournament service listening at port ${PORT}`)
    return fastify
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

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
  -put preHandler jWT into all routes from tournament that get accessed
  -add active confirm and change to join, update tournament and delete user
  -maybe deactivate route for tournament instead of using delete route
  -add open flag to update tournament
  -active true till scheduling

  -call get friends from um, check who has created a tournament and if ended_at is not filled yet 
  -if not deleting tms we need indacator to know which one is active
  -accept player to join the tournament -> for now not, only basic behavior
  -handle tournament time -> do with timestamp i get in update tournament request
  -handle deleting info via status

  meeting:
  - active bool in table, needed from matchmaking after ending or quitting
  - open bool

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

frontend:

- npm install --include=dev 

- npm run dev
*/