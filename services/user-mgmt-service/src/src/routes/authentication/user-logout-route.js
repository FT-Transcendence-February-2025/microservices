import authenticationController from "../../controllers/authentication-controller.js"

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/user-logout",
		schema: {
			body: {
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
						success: { type: "string" }
					},
					required: ["success"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "string" }
					},
					required: ["error"]
				}
			}
		},
		handler: authenticationController.makeUserOffline
		});
};
