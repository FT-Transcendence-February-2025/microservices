import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/new-user",
		schema: {
			body: {
				type: "object",
				properties: {
					userId: {
						type: "number",
						multipleOf: 1
					},
					displayName: { type: "string" }
				},
				required: ["userId", "displayName"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
					},
					required: ["success"]
				}
			}
		},
		handler: authenticationController.newUser
	});
};
