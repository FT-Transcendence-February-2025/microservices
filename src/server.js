import Fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000

const fastify = Fastify({
	logger: true
})

fastify.get('/', (request, reply) => {
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