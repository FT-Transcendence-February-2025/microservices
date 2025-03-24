import matchmakingController from "../../controllers/matchmaking-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/matchmaking",
		schema: {
			body: {
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
						displayName: { type: "string" }
					}
				}
			}
		},
		handler: matchmakingController.getDisplayName	
	});
};
