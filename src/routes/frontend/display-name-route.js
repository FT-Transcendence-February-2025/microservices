import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/display-name",
		schema: {
			body: {
				type: "object",
				properties: {
					displayName: { type: "string" }
				},
				required: ["displayName"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" }
					}
				}
			}
		},
		preHandler: jwtTr.verifyAccessToken,
		handler: frontendController.displayName	
	});
};
