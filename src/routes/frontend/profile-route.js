import jwtTr from "jwt-validator-tr";
import frontendController from "../../controllers/frontend-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/profile/:userId",
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
						wins: { type: "number" },
						loses: { type: "number" },
						online: { type: "boolean" }
					}
				},
				403: {
					type: "object",
					properties: { error: { type: "string" }}
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
		preHandler: jwtTr.verifyAccessToken,
		handler: frontendController.getUserProfile
	});
};
