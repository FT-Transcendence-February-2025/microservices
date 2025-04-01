import matchmakingController from "../../controllers/matchmaking-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/get-match-history/:userId",
		schema: {
			params: {
				type: "object",
				properties: {
					userId: {
						type: "number",
						multipleOf: 1
					}
				},
				required: ["userId"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						matches: {
							type: "array",
							items: {
								type: "object",
								properties: {
									userDisplayName: { type: "string" },
									opponentDisplayName: { type: "string" },
									userScore: { type: "number" },
									opponentScore: { type: "number" },
									matchDate: { 
										type: "string",
										format: "date-time"
									}
								}
							}
						}
					}
				},
				404: {
					type: "object",
					properties: { error: { type: "string" }}
				},
				500: {
					type: "object",
					properties: { error: { type: "string" }}
				}
			}
		},
		handler: matchmakingController.getMatchHistory
	});

};
