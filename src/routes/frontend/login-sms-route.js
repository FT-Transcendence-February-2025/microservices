import authenticationController from "../../controllers/authentication-controller.js";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/login-sms",
		schema: {
			body : {
				type: "object",
				properties: {
					verificationCode: {
						type: "string",
						pattern: "^[0-9]{6}$"
					}
				},
				required: ["verificationCode"]
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				},
				404: {
					type: "object",
					properties: {
						success: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				},
				410: {
					type: "object",
					properties: {
						success: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				},
				500: {
					type: "object",
					properties: {
						success: { type: "string" },
						token: { type: "string" }
					},
					required: ["success"]
				}
			}
		},
		handler: authenticationController.login
	});
};
