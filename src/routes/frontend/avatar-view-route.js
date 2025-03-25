import frontendController from "../../controllers/frontend-controller.js";
import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/avatar-view",
		schema: {
			response : {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						filePath: { type: "string" }
					},
					required: ["success", "filePath"]
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
		handler: frontendController.avatarView	
	});
};
