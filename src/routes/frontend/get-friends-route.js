import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/get-friends",
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						friends: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "number" },
									displayName: { type: "string" },
									avatarPath: { type: "string" },
									wins: { type: "number" },
									loses: { type: "number" }
								}
							}
						},
					required: ["success", "friends"]
					}
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
		preHandler: jwtTr.verifyAccessToken,
		handler: frontendController.getFriends	
	});
};
