import authenticationController from "../../controllers/authentication-controller.js"

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/user-exists",
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
						exists: { type: "boolean" }
					}
				}
			}
		},
		handler: authenticationController.userExists
		});
};
