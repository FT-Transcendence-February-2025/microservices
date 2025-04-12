import jwtTr from "jwt-validator-tr";
import frontendController from "../../controllers/frontend-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/respond-friend",
		schema: {
			body: {
				type: "object",
				properties: {
					invitingDisplayName: { type: "string" },
					accepted: { type: "boolean" }
				},
				required: ["invitingDisplayName", "accepted"]
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
		handler: frontendController.respondFriend
	});
};