import tournamentController from "../../controllers/tournament-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/invite-tournament",
		schema: {
			body: {
				type: "object",
				properties: {
					tournamentId: {
						type: "number",
						multipleOf: 1
					},
					tournamentName: { type: "string" },
					ids: {
						type: "array",
						items: { 
							type: "number",
							multipleOf: 1
						}
					}
				},
				required: ["tournamentId", "tournamentName", "ids"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
			}
		},
		handler: tournamentController.sendTournamentInvitations
	});
};