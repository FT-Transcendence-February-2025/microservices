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
					invitingId: {
						type: "number",
						multipleOf: 1
					},
					accepted: { type: "boolean" }
				},
				required: ["invitingId", "accepted"]
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
		preHandler: jwtTr.verifyAccessToken,
		handler: frontendController.respondFriend
	});
};