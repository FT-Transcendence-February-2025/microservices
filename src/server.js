import Fastify from 'fastify'
import dotenv from 'dotenv'
import { tournamentRoutes } from './routes/tournaments.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const fastify = Fastify({
	logger: true
})

// Routes
fastify.register(tournamentRoutes, {prefix: '/tournaments' })

fastify.get('/', (_request, reply) => {
	reply.send({
		message: 'Hello Fastify. Server is running'
	})
})

const start = async () => {
	try {
		await fastify.listen({ port: PORT, host: '0.0.0.0'})
		console.log(`Tournament service listening at port ${PORT}`)
	} catch (error) {
		fastify.log.error(error)
		process.exit(1)
	}
}

start()