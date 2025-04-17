import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/unblock-user",
		schema: {
			body: {
				type: "object",
				properties: {
					displayNameToUnblock: { type: "string" }
				},
				required: ["displayNameToUnblock"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
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
		handler: frontendController.unblockUser
	});
};
