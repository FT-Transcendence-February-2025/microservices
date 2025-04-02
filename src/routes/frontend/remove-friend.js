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
					idToRemove: {
						type: "number",
						multipleOf: 1
					}
				},
				required: ["idToRemove"]
			},
			response: {
				200: {
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