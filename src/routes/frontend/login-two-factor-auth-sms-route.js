import jwtTr from "jwt-validator-tr";

export default async function (fastify, opts) {
	fastify.route({
		method: "POST",
		url: "/login/two-factor-auth/sms",
		schema: {
			body: {
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
						success: { type: "string" }
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
		handler: authenticationController.
	});
};