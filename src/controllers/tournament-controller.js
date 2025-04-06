import frontendController from "./frontend-controller.js";

const tournamentController = {
	sendTournamentInvitations: async (request, reply) => {
		const { tournamentId, tournamentName, ids } = request.body;
		for (let i = 0; i < ids.length; i++) {
			const connection = frontendController.activeConnections.get(ids[i]);
			if (connection) {
				try {
					connection.send(JSON.stringify({ 
						type: "notification_tournament_invite",
						tournament: {
							id: tournamentId,
							name: tournamentName
						}
					}));
				} catch (error) {
					console.error(`Error in function tournamentController in function connection.send: `, error, `. Skipping this 
						notification...`);
				}
			}
		}
		return reply.status(200).send({ success: "Sent tournament invitations to online users" });
	}
};

export default tournamentController;