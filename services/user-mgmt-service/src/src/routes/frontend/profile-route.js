import jwtTr from "jwt-validator-tr";
import frontendController from "../../controllers/frontend-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/profile/:displayName",
		schema: {
			params: {
				type: "object",
				properties: {
					displayName: { type: "string" }
				}
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						displayName: { type: "string" },
						avatarPath: { type: "string" },
						wins: { type: "number" },
						loses: { type: "number" },
						online: { type: "boolean" },
						matchHistory: {
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
					},
					required: ["success", "displayName", "avatarPath", "wins", "loses", "online", "matchHistory"]
				},
				403: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
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
		handler: frontendController.getUserProfile
	});
};
