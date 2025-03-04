export const tournamentRoutes = function(fastify, options) {
	// Register player for tournament
	fastify.post('/:tournamentId/register', async (request, reply) => {
		const { tournamentId } = request.params
		const { playerId } = request.body

		// TODO: implement registration logic with databse
		return{
			success: true,
			message: `Player ${playerId} registered for tournament ${tournamentId}`
		}
	})

	// Unregistered player for tournament
	fastify.delete('/:tournamentId/register', async(request, reply) => {
		const { tournamentId } = request.params
		const { playerId } = request.body

		// TODO: implement unregistration logic
		return {
			success: true,
			message: `Player ${playerId} unregistered from tournament ${tournamentId}`
		}
	})
}
