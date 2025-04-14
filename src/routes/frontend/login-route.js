import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/login",
		schema: {
			body : {
				type: "object",
				properties: {
					email: { type: "string" },
					password: { type: "string" }
				},
				required: ["email", "password"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						route: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				},
				400: {
					type: "object",
					properties: {
						error: { type: "error" }
					},
					required: ["error"]
				},
				404: {
					type: "object",
					properties: {
						error: { type: "error" }
					},
					required: ["error"]
				},
				500: {
					type: "object",
					properties: {
						error: { type: "error" }
					},
					required: ["error"]
				}
			}
		},
		handler: authenticationController.loginSms
	});
};
