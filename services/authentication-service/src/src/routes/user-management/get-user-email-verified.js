import userManagementController from "../../controllers/user-management-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/get-user-email-verified",
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
						verified: { type: "boolean" }
					},
					required: ["verified"]
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
		handler: userManagementController.getUserEmailVerified
	});
};
