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
					invitingUserId: {
						type: "number",
						multipleOf: 1
					},
					ids: {
						type: "array",
						items: { 
							type: "number",
							multipleOf: 1
						}
					}
				},
				required: ["tournamentId", "tournamentName", "invitingUserId", "ids"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
				500: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				}
			}
		},
		handler: tournamentController.sendTournamentInvitations
	});
};