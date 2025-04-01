import matchmakingController from "../controllers/matchmaking-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/get-user/:userId",
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
						displayName: { type: "string" },
						avatarPath: { type: "string" },
						wins: {
							type: "number",
							multipleOf: 1
						},
						loses: {
							type: "number",
							multipleOf: 1
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
		handler: matchmakingController.getUser	
	});
};
