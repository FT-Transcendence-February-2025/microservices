import commonBackendController from "../../controllers/common-backend-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "GET",
		url: "/get-user/:userId",
		schema: {
			params: {
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
						success: { type: "string" },
						displayName: { type: "string" },
						avatarPath: { type: "string" },
						wins: { type: "number" },
						loses: { type: "number" },
						online: { type: "boolean" }
					},
					required: ["success", "displayName", "avatarPath", "wins", "loses", "online"]
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
		handler: commonBackendController.getUser	
	});
};
