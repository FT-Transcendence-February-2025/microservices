import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/remove-friend",
		schema: {
			body: {
				type: "object",
				properties: {
					displayNameToRemove: { type: "string" }
				},
				required: ["displayNameToRemove"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
				400: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
				404: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				},
				500: {
					type: "object",
					properties: {
						success: { type: "string" }
					},
					required: ["success"]
				}
			}
		},
		preHandler: jwtTr.verifyAccessToken,
		handler: frontendController.removeFriend
	});
};