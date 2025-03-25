import { matchesController } from '../controllers/matchesControllers.js'

export default async function (fastify) {
  // Register match results
  fastify.post('/results', matchesController.postMatchResults)
}
