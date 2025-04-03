import matchmakingController from "../../controllers/matchmaking-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/update-match-history",
		schema: {
			body: {
				type: "object",
				properties: {
					userId: {
						type: "number",
						multipleOf: 1
					},
					opponentId: {
						type: "number",
						multipleOf: 1
					},
					userScore: { 
						type: "number",
						multipleOf: 1
					},
					opponentScore: {
						type: "number",
						multipleOf: 1
					},
					matchDate: { 
						type: "string",
						format: "date-time"
					}
				},
				required: ["userId", "opponentId", "userScore", "opponentScore", "matchDate"],
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
					},
					required: ["success"]
				}
			}
		},
		handler: matchmakingController.updateMatchHistory	
	});
};
